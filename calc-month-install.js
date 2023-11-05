function calculateMonthlyInstallment(
  principal,
  annualInterestRate,
  tenureMonths
) {
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const emi =
    (principal *
      monthlyInterestRate *
      Math.pow(1 + monthlyInterestRate, tenureMonths)) /
    (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1);

  return emi.toFixed(2);
}

module.exports = calculateMonthlyInstallment;
