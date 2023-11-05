const calculateScore = require("./calculate-credit-score.js");
const approveLoan = require("./approveLoan.js");
const model = require("./model.js");
const customers = model.customer;
const loan = model.loan;
const calculateMonthlyInstallment = require("./calc-month-install.js");

async function check_eligibility(req) {
  const { customer_id, loan_amount, interest_rate, tenure } = req.body;

  try {
    const customer = await customers.findByPk(customer_id);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    const customerLoans = await loan.findAll({
      where: { customer_id: customer_id },
    });
    const creditScore = calculateScore(customerLoans, customer);
    console.log(creditScore);
    const totalEMI = customerLoans.reduce(
      (sum, loan) => sum + loan.monthly_repayment,
      0
    );
    const { isApproved, correctedInterestRate } = approveLoan(
      creditScore,
      interest_rate,
      customer.monthly_salary,
      totalEMI
    );
    const monthly_install = calculateMonthlyInstallment(
      loan_amount,
      correctedInterestRate,
      tenure
    );
    return {
      customer_id: customer_id,
      approval: isApproved,
      interest_rate: interest_rate,
      correctedInterestRate: correctedInterestRate,
      tenure: tenure,
      monthly_installment: monthly_install,
    };
  } catch (error) {
    console.error(error);
  }
}

module.exports = check_eligibility;
