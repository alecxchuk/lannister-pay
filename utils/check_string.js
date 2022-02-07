// checks if value is a string
// returns true if value is a string
// returns false otherwise
exports.isString = (string) => {
  if (typeof string === "string") {
    return true;
  } else {
    return false;
  }
};
// Helper function to check if a value is a number
// returns true if value is a number
// returns false otherwise
exports.isNumber = (number) => {
  if (isNaN(number)) {
    return true;
  } else {
    return false;
  }
};
exports.isBoolean = (boolean) => {
  if (typeof boolean === "boolean") {
    return true;
  } else {
    return false;
  }
};
exports.isObject = (object) => {
  if (typeof object === "object") {
    return true;
  } else {
    return false;
  }
};
