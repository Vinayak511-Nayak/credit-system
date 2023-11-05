function calculateScore(customerLoans, customerData) {
  let pastLoansPaidOnTime = 0;
  let numLoansTakenInPast = customerLoans.length;
  let loanActivityInCurrentYear = 0;
  const approvedLimit = customerData.approved_limit;

  for (const loan of customerLoans) {
    pastLoansPaidOnTime += loan.emi_paid_ontime;
    const loanStartDate = new Date(loan.start_date);
    if (loanStartDate.getFullYear() === new Date().getFullYear()) {
      loanActivityInCurrentYear += 1;
    }
  }
  const currentDebt = customerLoans.reduce((totalDebt, loan) => {
    return totalDebt + loan.loan_amount;
  }, 0);
  if (currentDebt > approvedLimit) {
    return 0;
  }
  let creditScore = 11;
  creditScore += pastLoansPaidOnTime * 10;
  creditScore += numLoansTakenInPast * 5;
  creditScore += loanActivityInCurrentYear * 5;
  console.log(creditScore);
  return creditScore;
}

module.exports = calculateScore;
