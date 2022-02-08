// This file Holds response messages
exports.invalidFeeConfig = "Invalid Fee Configuration specs";
exports.undefinedFeeConfig = "The property FeeConfigurationSpec is not defined";
exports.feeConfigNotAString = "Fee configuration spec should be a string";
exports.invalidValueMessage = (entity, value) =>
  `${entity} is not a valid ${value}`;
exports.flatPercErrorMessage = (entity, value) =>
  `${entity} cannot have ${value} as fee value`;
exports.invalidType = (entity, type) => `${entity} should be a ${type}`;
exports.noValueFoundInFeeConfigError = (entity) =>
  `No ${entity} found in fee configuration`;
exports.notDefined = (entity) => `The property ${entity} is not defined`;
exports.noFeeConfig = "No fees configuration specs found";
exports.invalidPayment = "Invalid payment transaction";
