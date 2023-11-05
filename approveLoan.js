function approveLoan(creditScore, interestRate, monthlySalary, currentEmis) {
  if (currentEmis > 0.5 * monthlySalary || creditScore < 10) {
    return {
      isApproved: false,
      correctedInterestRate: 0,
    };
  } else if (creditScore > 50) {
    const correctedInterestRate = interestRate;
    return {
      isApproved: true,
      correctedInterestRate,
    };
  } else if (creditScore >= 30 && creditScore <= 50) {
    const correctedInterestRate = Math.max(interestRate, 12);
    return {
      isApproved: true,
      correctedInterestRate,
    };
  } else if (creditScore >= 10 && creditScore < 30) {
    const correctedInterestRate = Math.max(interestRate, 16);
    return {
      isApproved: true,
      correctedInterestRate,
    };
  } else {
    return {
      isApproved: false,
      correctedInterestRate: 0,
    };
  }
}
module.exports = approveLoan;
