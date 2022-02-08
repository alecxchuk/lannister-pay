const { paymentProps } = require("./string_helpers");

// checks if all items in an array have value '*'
exports.allIn = (arr, check) => arr.every((val) => val[check] === "*");

// Checks if there is no entry for a particular fee spec property in the fee configuration list
exports.noEntry = (arr, entity, value) => {
  if (entity === "entity_property") {
    for (let prop of paymentProps) {
      return !arr.some(
        (fee) =>
          fee[entity].toString() === value[prop].toString() ||
          fee[entity] === "*"
      );
    }
  } else {
    return !arr.some((fee) => fee[entity] === value || fee[entity] === "*");
  }
};
