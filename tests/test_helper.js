exports.testConfigSpecs = {
  FeeConfigurationSpec: "LNPY1221 NGN * *(*) : APPLY PERC 1.4",
};

exports.expectedFeePayload = {
  fee_id: "LNPY1221",
  fee_currency: "NGN",
  fee_locale: "*",
  fee_entity: "*",
  entity_property: "*",
  fee_type: "PERC",
  fee_value: "1.4",
};

exports.sampleDb = {
  fees: [
    {
      fee_id: "LNPY1221",
      fee_currency: "NGN",
      fee_locale: "*",
      fee_entity: "*",
      entity_property: "*",
      fee_type: "PERC",
      fee_value: "1.4",
    },
    {
      fee_id: "LNPY1222",
      fee_currency: "NGN",
      fee_locale: "INTL",
      fee_entity: "CREDIT-CARD",
      entity_property: "VISA",
      fee_type: "PERC",
      fee_value: "5.0",
    },
    {
      fee_id: "LNPY1223",
      fee_currency: "NGN",
      fee_locale: "LOCL",
      fee_entity: "CREDIT-CARD",
      entity_property: "*",
      fee_type: "FLAT_PERC",
      fee_value: "50:1.4",
    },
    {
      fee_id: "LNPY1224",
      fee_currency: "NGN",
      fee_locale: "*",
      fee_entity: "BANK-ACCOUNT",
      entity_property: "*",
      fee_type: "FLAT",
      fee_value: "100",
    },
    {
      fee_id: "LNPY1225",
      fee_currency: "NGN",
      fee_locale: "*",
      fee_entity: "USSD",
      entity_property: "MTN",
      fee_type: "PERC",
      fee_value: "0.55",
    },
  ],
};

exports.bodyData = [
  {
    Currency: "NGN",
    CurrencyCountry: "NG",
    Customer: {
      BearsFee: true,
    },
    PaymentEntity: {
      Issuer: "GTBANK",
      Brand: "MASTERCARD",
      Type: "CREDIT-CARD",
      Country: "NG",
    },
  },
  {
    Amount: 5000,
    CurrencyCountry: "NG",
    Customer: {
      BearsFee: true,
    },
    PaymentEntity: {
      Issuer: "GTBANK",
      Brand: "MASTERCARD",
      Type: "CREDIT-CARD",
      Country: "NG",
    },
  },
  {
    Amount: 5000,
    Currency: "NGN",
    Customer: {
      BearsFee: true,
    },
    PaymentEntity: {
      Issuer: "GTBANK",
      Brand: "MASTERCARD",
      Type: "CREDIT-CARD",
      Country: "NG",
    },
  },
  {
    Amount: 5000,
    Currency: "NGN",
    CurrencyCountry: "NG",

    PaymentEntity: {
      Issuer: "GTBANK",
      Brand: "MASTERCARD",
      Type: "CREDIT-CARD",
      Country: "NG",
    },
  },
  {
    Amount: 5000,
    Currency: "NGN",
    CurrencyCountry: "NG",
    Customer: {},
    PaymentEntity: {
      Issuer: "GTBANK",
      Brand: "MASTERCARD",
      Type: "CREDIT-CARD",
      Country: "NG",
    },
  },
  {
    Amount: 5000,
    Currency: "NGN",
    CurrencyCountry: "NG",
    Customer: {
      BearsFee: true,
    },
  },
  {
    Amount: 5000,
    Currency: "NGN",
    CurrencyCountry: "NG",
    Customer: {
      BearsFee: true,
    },
    PaymentEntity: {
      Brand: "MASTERCARD",
      Type: "CREDIT-CARD",
      Country: "NG",
    },
  },
  {
    Amount: 5000,
    Currency: "NGN",
    CurrencyCountry: "NG",
    Customer: {
      BearsFee: true,
    },
    PaymentEntity: {
      Issuer: "GTBANK",
      Type: "CREDIT-CARD",
      Country: "NG",
    },
  },
  {
    Amount: 5000,
    Currency: "NGN",
    CurrencyCountry: "NG",
    Customer: {
      BearsFee: true,
    },
    PaymentEntity: {
      Issuer: "GTBANK",
      Brand: "MASTERCARD",
      Country: "NG",
    },
  },
  {
    Amount: 5000,
    Currency: "NGN",
    CurrencyCountry: "NG",
    Customer: {
      BearsFee: true,
    },
    PaymentEntity: {
      Issuer: "GTBANK",
      Brand: "MASTERCARD",
      Type: "CREDIT-CARD",
    },
  },
  {},
];

exports.computeTestData = {
  Amount: 5000,
  Currency: "NGN",
  CurrencyCountry: "NG",
  Customer: {
    BearsFee: true,
  },
  PaymentEntity: {
    Issuer: "GTBANK",
    Brand: "MASTERCARD",
    Type: "CREDIT-CARD",
    Country: "NG",
  },
};

exports.computeTestRequests = [
  {
    ID: 91203,
    Amount: 5000,
    Currency: "NGN",
    CurrencyCountry: "NG",
    Customer: {
      ID: 2211232,
      EmailAddress: "anonimized29900@anon.io",
      FullName: "Abel Eden",
      BearsFee: true,
    },
    PaymentEntity: {
      ID: 2203454,
      Issuer: "GTBANK",
      Brand: "MASTERCARD",
      Number: "530191******2903",
      SixID: "530191",
      Type: "CREDIT-CARD",
      Country: "NG",
    },
  },
  {
    ID: 91204,
    Amount: 3500,
    Currency: "NGN",
    CurrencyCountry: "NG",
    Customer: {
      ID: 4211232,
      EmailAddress: "anonimized292200@anon.io",
      FullName: "Wenthorth Scoffield",
      BearsFee: false,
    },
    PaymentEntity: {
      ID: 2203454,
      Issuer: "AIRTEL",
      Brand: "",
      Number: "080234******2903",
      SixID: "080234",
      Type: "USSD",
      Country: "NG",
    },
  },
  {
    ID: 91204,
    Amount: 3500,
    Currency: "USD",
    CurrencyCountry: "US",
    Customer: {
      ID: 4211232,
      EmailAddress: "anonimized292200@anon.io",
      FullName: "Wenthorth Scoffield",
      BearsFee: false,
    },
    PaymentEntity: {
      ID: 2203454,
      Issuer: "WINTERFELLWALLETS",
      Brand: "",
      Number: "AX0923******0293",
      SixID: "AX0923",
      Type: "WALLET-ID",
      Country: "NG",
    },
  },
];

exports.computeTestResponses = [
  {
    AppliedFeeID: "LNPY1223",
    AppliedFeeValue: 120,
    ChargeAmount: 5120,
    SettlementAmount: 5000,
  },
  {
    AppliedFeeID: "LNPY1221",
    AppliedFeeValue: 49,
    ChargeAmount: 3500,
    SettlementAmount: 3451,
  },
  {
    Error: "No fee configuration for USD transactions.",
  },
];
