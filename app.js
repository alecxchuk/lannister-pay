require("dotenv").config();

// express
const express = require("express");
var responseTime = require("response-time");

// database helper
// const db = require("./db/db_helper");
module.exports = function (database) {
  const app = express();
  app.use(express.json());
  app.use(
    responseTime((req, res, time) => {
      console.log(req.method, req.url, time + "ms");
    })
  );
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
