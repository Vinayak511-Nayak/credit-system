const Sequelize = require("sequelize");
const config = require("./config");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  }
);

const customers = sequelize.define("customers", {
  customer_id: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  first_name: {
    type: Sequelize.DataTypes.STRING,
  },
  last_name: {
    type: Sequelize.DataTypes.STRING,
  },
  age: {
    type: Sequelize.DataTypes.INTEGER,
  },
  phone_number: {
    type: Sequelize.DataTypes.STRING,
  },
  monthly_salary: {
    type: Sequelize.DataTypes.INTEGER,
  },
  approved_limit: {
    type: Sequelize.DataTypes.INTEGER,
  },
});

const loan = sequelize.define("loan", {
  /*id: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },*/
  loan_id: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  loan_amount: {
    type: Sequelize.DataTypes.INTEGER,
  },
  tenure: {
    type: Sequelize.DataTypes.INTEGER,
  },
  interest_rate: {
    type: Sequelize.DataTypes.INTEGER,
  },
  monthly_repayment: {
    type: Sequelize.DataTypes.INTEGER,
  },
  emi_paid_ontime: {
    type: Sequelize.DataTypes.INTEGER,
  },
  start_date: {
    type: Sequelize.DataTypes.DATE,
  },
  end_date: {
    type: Sequelize.DataTypes.DATE,
  },
  customer_id: {
    type: Sequelize.DataTypes.INTEGER,
    references: {
      model: "customers",
      key: "customer_id",
    },
  },
});
loan.belongsTo(customers, {
  foreignKey: "customer_id",
  targetKey: "customer_id",
});

customers.hasMany(loan, {
  foreignKey: "customer_id",
  sourceKey: "customer_id",
});
/*customers
  .sync({ force: true })
  .then(() => {
    console.log("User table created (if it doesn't exist)");
  })
  .catch((error) => {
    console.error("Error creating User table:", error);
  });

loan
  .sync({ force: true })
  .then(() => {
    console.log("loan table created (if it doesn't exist)");
  })
  .catch((error) => {
    console.error("Error creating loan table:", error);
  });*/

module.exports = { sequelize: sequelize, customer: customers, loan: loan };
