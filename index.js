const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 3000;
const router = require("./router");
app.use(bodyParser.json());
app.use("/", router);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
