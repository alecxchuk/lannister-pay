const makeApp = require("./app");
const db = require("./db/db_helper");
require("dotenv").config();

const app = makeApp(db);
const port = process.env.PORT || 3001;

app.listen(
  port,
  () => {}
  // console.log(`server is up and listening on port ${port}`)
);
