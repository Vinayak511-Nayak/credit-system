const express = require("express");
const router = express.Router();
const model = require("./model.js");
const customer = model.customer;
const loan = model.loan;
const sequelize = model.sequelize;
const calculateScore = require("./calculate-credit-score.js");
const approveLoan = require("./approveLoan.js");
const check_eligibility = require("./check_eligibility.js");
const customer_loan = require("./load_customer_loan.js");
const xlsx = require("./load_customer_loan.js");
const customer_xlsx = xlsx.customer_data;
const loan_xlsx = xlsx.loan_data;
router.get("/ingest_data", async (req, res) => {
  //const add_customer = await customer.bulkCreate(customer_xlsx);
  const add_loan = await loan.bulkCreate(loan_xlsx, { ignoreDuplicates: true });
  res.send("sucessfully added");
});

router.post("/register", async (req, res) => {
  try {
    const data = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      phone_number: req.body.phone_number,
    };
    const find_customer = await customer.findOne({ where: data });
    if (find_customer) res.send("user already present").status(400);
    const monthly_income = Math.round(req.body.monthly_income);
    const approved_limit =
      Math.round(req.body.monthly_income / 100000) * 100000 * 36;

    const payload = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      age: req.body.age,
      monthly_salary: monthly_income,
      phone_number: req.body.phone_number,
      approved_limit: approved_limit,
    };
    const insertCustomerSQL = `
    INSERT INTO customers (first_name, last_name, age, monthly_salary, phone_number, approved_limit)
    VALUES (?, ?, ?, ?, ?,?);
  `;
    const [insertedCustomer] = await sequelize.query(insertCustomerSQL, {
      replacements: [
        req.body.first_name,
        req.body.last_name,
        req.body.age,
        req.body.monthly_income,
        req.body.phone_number,
        approved_limit,
      ],
      type: sequelize.QueryTypes.INSERT,
    });
    console.log(insertedCustomer);
    const response = {
      customer_id: insertedCustomer,
      name: req.body.first_name,
      age: req.body.age,
      monthly_income: req.body.monthly_income,
      approved_limit: approved_limit,
      phone_number: req.body.phone_number,
    };

    res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.json({ error: "Internal Server Error" }).status(500);
  }
});

router.get("/check-eligibility", async (req, res) => {
  try {
    const response = await check_eligibility(req);
    res.send(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/create-loan", async (req, res) => {
  try {
    const response = await check_eligibility(req);
    if (!response.approval) {
      return res.json({
        loan_id: null,
        customer_id: response.customer_id,
        loan_approved: false,
        message: "Loan not approved based on eligibility criteria",
        monthly_installment: 0,
      });
    }
    const newLoan = await loan.create({
      customer_id: req.body.customer_id,
      loan_amount: req.body.loan_amount,
      monthly_repayment: response.monthly_installment,
      interest_rate: response.correctedInterestRate,
      tenure: req.body.tenure,
    });

    return res.json({
      loan_id: newLoan.loan_id,
      customer_id: newLoan.customer_id,
      loan_approved: true,
      message: "Loan approved",
      interest_rate: req.body.interest_rate,
      corrected_interest_rate: newLoan.interest_rate,
      monthly_installment: response.monthly_installment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      loan_id: null,
      customer_id: req.customer_id,
      loan_approved: false,
      message: "Internal Server Error",
      monthly_installment: 0,
    });
  }
});

router.get("/view-loan/:loan_id", async (req, res) => {
  const loanId = parseInt(req.params.loan_id);

  try {
    const loanDetails = await loan.findOne({
      raw: true,
      where: { loan_id: loanId },
      include: [
        {
          model: customer,
          attributes: [
            "customer_id",
            "first_name",
            "last_name",
            "phone_number",
            "age",
          ],
        },
      ],
    });

    if (!loanDetails) {
      return res.status(404).json({ error: "Loan not found" });
    }
    const { loan_amount, interest_rate, tenure, monthly_repayment } =
      loanDetails;

    return res.json({
      loan_id: loanId,
      customer: {
        id: loanDetails["customer.customer_id"],
        first_name: loanDetails["customer.first_name"],
        last_name: loanDetails["customer.last_name"],
        phone_number: loanDetails["customer.phone_number"],
        age: loanDetails["customer.age"],
      },
      loan_approved: true,
      interest_rate: interest_rate,
      monthly_installment: monthly_repayment,
      tenure: loanDetails.tenure,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/make-payment/:customer_id/:loan_id", async (req, res) => {
  const customerId = parseInt(req.params.customer_id);
  const loanId = parseInt(req.params.loan_id);
  const { paid_amount } = req.body;

  try {
    const loanDetails = await loan.findOne({
      raw: true,
      where: { loan_id: loanId },
      include: [{ model: customer }],
    });

    if (!loanDetails) {
      return res.status(404).json({ error: "Loan not found" });
    }

    const { monthly_repayment, tenure } = loanDetails;
    if (loanDetails["customer.customer_id"] !== customerId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const dueInstallmentAmount = monthly_repayment;

    if (paid_amount < dueInstallmentAmount) {
      return res
        .status(400)
        .json({ error: "Paid amount is less than the due installment amount" });
    } else if (paid_amount > dueInstallmentAmount) {
      const remainingTenure = Math.max(0, tenure - 1);
      const adjustedMonthlyInstallment =
        (loanDetails.loan_amount - paid_amount) / remainingTenure;
      await loan.update(
        {
          tenure: remainingTenure,
          monthly_repayment: adjustedMonthlyInstallment,
        },
        { where: { loan_id: loanId } }
      );
    }

    return res.json({ message: "Payment processed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/view-statement/:customer_id/:loan_id", async (req, res) => {
  const customerId = parseInt(req.params.customer_id);
  const loanId = parseInt(req.params.loan_id);

  try {
    const loanDetails = await loan.findOne({
      where: { loan_id: loanId },
      raw: true,
      include: [{ model: customer }],
    });

    if (!loanDetails) {
      return res.status(404).json({ error: "Loan not found" });
    }

    if (loanDetails["customer.customer_id"] !== customerId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const loanStatement = {
      customer_id: customerId,
      loan_id: loanId,
      loan_items: [
        {
          loan_amount: loanDetails.loan_amount,
          interest_rate: loanDetails.interest_rate,
          monthly_installment: loanDetails.monthly_repayment,
          tenure: loanDetails.tenure,
          repayments_left:
            loanDetails.tenure - (loanDetails.emi_paid_ontime || 0),
          repayments_left:
            loanDetails.tenure - (loanDetails.emi_paid_ontime || 0),
        },
      ],
    };

    return res.json(loanStatement);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
