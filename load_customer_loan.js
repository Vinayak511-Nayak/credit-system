const path = require("path");
const XLSX = require("xlsx");
const pathToProjectFolder = "./";
const customerPathInProject = path.join(
  pathToProjectFolder,
  "customer_data.xlsx"
);
const customerworkbook = XLSX.readFile(customerPathInProject);
const sheetName = customerworkbook.SheetNames[0];
const worksheet = customerworkbook.Sheets[sheetName];
const customer_data = XLSX.utils.sheet_to_json(worksheet);

const loanPathInProject = path.join(pathToProjectFolder, "loan_data.xlsx");
const loanworkbook = XLSX.readFile(loanPathInProject);
const loan_sheetName = loanworkbook.SheetNames[0];
const loan_sheet = loanworkbook.Sheets[loan_sheetName];
const loan_data = XLSX.utils.sheet_to_json(loan_sheet);
module.exports = { customer_data, loan_data };
