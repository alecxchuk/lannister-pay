exports.validFeeTypes = ["PERC", "FLAT", "FLAT_PERC"];
exports.validFeeEntities = [
  "CREDIT-CARD",
  "DEBIT-CARD",
  "BANK-ACCOUNT",
  "USSD",
  "WALLET-ID",
  "*",
];
exports.validFeeLocales = ["LOCL", "INTL", "*"];

// relevant properties from computeTransactionFee request body
exports.relevantProps = [
  "Amount",
  "Currency",
  "CurrencyCountry",
  "PaymentEntity",
  "Customer",
];
// sub properties for computeTransactionFee payment object
exports.paymentProps = [
  "ID",
  "Issuer",
  "Number",
  "SixID",
  "Brand",
  "Type",
  "Country",
];
// sub properties for computeTransactionFee customer object
exports.customerProps = ["BearsFee"];
// possible fee entities
exports.feeEntityProps = [
  "CREDIT-CARD",
  "DEBIT-CARD",
  "BANK-ACCOUNT",
  "USSD",
  "WALLET-ID",
];
