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

// CONSTANT VALUES
exports.PAYMENT_ENTITY = "PaymentEntity";
exports.BEARS_FEE = "BearsFee";
exports.CUSTOMER = "Customer";
exports.CURRENCY_COUNTRY = "CurrencyCountry";
exports.CURRENCY = "Currency";
exports.AMOUNT = "Amount";
exports.ISSUER = "Issuer";
exports.BRAND = "Brand";
exports.NUMBER = "Number";
exports.TYPE = "Type";
exports.COUNTRY = "Country";
exports.ID = "ID";
exports.SIX_ID = "SixID";
exports.LOCL = "LOCL";
exports.INTL = "INTL";
exports.PERC = "PERC";
exports.FLAT = "FLAT";
exports.FLAT_PERC = "FLAT_PERC";
exports.FLAT = "FLAT";
exports.FEE_LOCALE = "fee_locale";
exports.FEE_ENTITY = "fee_entity";
exports.ENTITY_PROPERTY = "entity_property";
