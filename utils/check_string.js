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
// Helper function to check if a value is a numeric
// returns true if value is a number
// returns false otherwise
exports.isNumeric = (number) => {
  if (isNaN(number)) {
    return true;
  } else {
    return false;
  }
};
// Helper function to check if a value is of type number
// returns true if value's type is a number
// returns false otherwise
exports.isNumber = (number) => {
  if (typeof number === "number") {
    return true;
  } else {
    return false;
  }
};
// Helper function to check if a value is of type boolean
// returns true if value is a boolean
// returns false otherwise
exports.isBoolean = (boolean) => {
  if (typeof boolean === "boolean") {
    return true;
  } else {
    return false;
  }
};

// Helper function to check if a value is of type object
// returns true if value is a object
// returns false otherwise
exports.isObject = (object) => {
  if (typeof object === "object") {
    return true;
  } else {
    return false;
  }
};
