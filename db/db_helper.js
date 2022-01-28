const fs = require("fs");

const path = require("path");

const dbFilePath = path.join(__dirname, "db.json"); //  path to the json file where we are storing our hash data
const MAX_TRY_COUNT = 5; //  Maximum numebr of attempts in case of failure

let readTryCount = 0; // hold the read try count
let writeTryCount = 0; // hold the write try count

const hash = {};

//  to get the value for a particular index
const get = (index) =>
  typeof hash[index] !== "undefined" ? hash[index] : null;
const getAll = () => hash;

//  add a new value in a particular index
const set = (index, data) => {
  if (typeof hash[index] === "undefined") {
    hash[index] = [];
  }
  if (index === "fees") {
    hash[index] = data;
  } else {
    hash[index].push(data);
  }

  commitDB();
};

const itemExist = (index, id) => {
  if (hash[index].filter((e) => e.fee_id === id).length > 0) {
    return true;
  }
  return false;
};

//  remove a value from a particular index
const pop = (index, value) => {
  if (typeof hash[index] === "undefined") {
    return true;
  }

  const valueIndex = hash[index].indexOf(value);
  if (valueIndex > -1) {
    hash[index].splice(valueIndex, 1);
  }

  commitDB(); // updating the file with latest hash content

  return true;
};

//  remove all values stored in a particular index
const remove = (index) => {
  if (typeof hash[index] !== "undefined") {
    delete hash[index];
  }

  commitDB(); // updating the file with latest hash content

  return true;
};

const readDB = () => {
  fs.readFile(dbFilePath, "utf8", (err, data) => {
    if (err) {
      if (readTryCount < MAX_TRY_COUNT) {
        setTimeout(readDB, 1000); //  let's try again 1s later
      } else {
        throw err; //  raise the error
      }
    }
    // console.log(data, "aa");
    try {
      data = JSON.parse(data);
      //  hash is a constant so we can't directly assign the data
      //  we can assign properties by the way
      for (key in data) {
        hash[key] = data[key]; // copies each property to the data object
      }
      readTryCount = 0;
    } catch (e) {
      console.log("evf");
      //   throw e; //  bad data?
    }
  });
};

//  commiting the changes in the file
const commitDB = () => {
  const data = JSON.stringify(hash);
  const options = {
    encoding: "utf8",
  };

  fs.writeFile(dbFilePath, data, options, (err) => {
    if (err) {
      if (writeTryCount < MAX_TRY_COUNT) {
        setTimeout(commitDB, 1000); // let's try again 1s later
        writeTryCount++;
      } else {
        throw err; // raise the error
      }
    }

    // file is updated so nothing to do here...
    writeTryCount = 0;
  });
};

//  Read the file for the first time when the module loads
readDB();

//  exposing the getter and setters
exports.get = get;
exports.set = set;
exports.pop = pop;
exports.getAll = getAll;
exports.remove = remove;
exports.readDB = readDB;
exports.itemExist = itemExist;
