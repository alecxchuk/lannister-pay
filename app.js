require("dotenv").config();

// express
const express = require("express");
// database helper
// const db = require("./db/db_helper");
const morgan = require("morgan");

module.exports = function (database) {
  const app = express();
  app.use(express.json());
  app.use(morgan("dev"));

  // cors
  const cors = require("cors");
  app.use(cors());

  // version1 routes
  const version1 = require("./routes/v1");

  const version = version1(database);

  //   app.use("/", version1);
  app.use("/", version);

  return app;
};

// module.exports = app;
