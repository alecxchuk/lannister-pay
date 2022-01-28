require("dotenv").config();

// express
const express = require("express");
// database helper
const db = require("./db/db_helper");

const app = express();
app.use(express.json());
// cors
const cors = require("cors");
app.use(cors());

// version1 routes
const version1 = require("./routes/v1");

app.use("/api/v1", version1);

const port = process.env.PORT || 3001;
app.listen(port, () =>
  console.log(`server is up and listening on port ${port}`)
);
