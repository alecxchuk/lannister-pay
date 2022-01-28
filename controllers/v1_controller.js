const db = require("../db/db_helper");
const { allIn } = require("../utils/check_array");
const { sendSuccess, sendError } = require("../utils/responseHandler");

// Controller for fees endpoint
exports.fees = async (req, res) => {
  try {
    // destruction req.body
    const { FeeConfigurationSpec } = req.body;
    // arr for the payload
    let payloadList = [];
    // split response to get each fee value
    const sampleList = FeeConfigurationSpec.split("\n");

    // map the list to
    sampleList.map((sample) => {
      const payload = sample.split(" ");
      const fee_entity = payload[3].split("(")[0];

      // entity property
      const entity_property = payload[3].split("(")[1].split(")")[0];

      // payload
      const testPayload = {
        fee_id: payload[0],
        fee_currency: payload[1],
        fee_locale: payload[2],
        fee_entity: fee_entity,
        entity_property: entity_property,
        fee_type: payload[6],
        fee_value: payload[7],
      };
      payloadList.push(testPayload);
    });

    // save to db
    db.set("fees", payloadList);

    // success response
    sendSuccess(
      res,
      { results: payloadList.length, payloadList },
      "success",
      201
    );
  } catch (err) {
    // error
    sendError(res, { message: "failure" });
  }
};

// Controller for compute transaction fee endpoint
exports.computeTransactionFee = async (req, res) => {
  try {
    // deconstruct the req body to get;
    // Amount: The non-negative, numeric transaction amount.
    // Currency: The transaction currency.
    // CurrencyCountry: Country the transaction currency is applicable in. Useful for determining the transaction locale.
    // PaymentEntity: An object representing the payment entity to be charged for the transaction.
    // Customer: An object containing the customer information.
    const { Amount, Currency, CurrencyCountry, PaymentEntity, Customer } =
      req.body;
    // deconstructing the payment entity object to get
    // Issuer: The issuing company / organization for the entity e.g. Banks, Telco Providers / Wallet Service Providers.
    // Brand: Applicable only to card-type transactions e.g. MASTERCARD, VISA, AMEX, VERVE e.t.c.
    // Number:The payment entity number (masked pan in case of credit/debit cards, bank account numbers, mobile numbers, wallet ids e.t.c.)
    // Type: the entity to be charged for the transaction e.g CREDIT-CARD, DEBIT-CARD, BANK-ACCOUNT, USSD, WALLET-ID
    // Country:  the country of the payment entity
    const { Issuer, Brand, Number, Type, Country } = PaymentEntity;
    // Deconstruct the customer object to get;
    // BearsFee: Indicates whether or not the customer is set to bear the transaction cost.
    const { BearsFee } = Customer;

    // get fees from the database
    const feeList = db.getAll().fees;
    //
    let fees = [];

    // filters off a
    fees = feeList.filter((fee) => fee.fee_currency === Currency);

    // local variable storing the applied fee value
    let AppliedFeeValue = 0;
    // local variable storing the charge amount
    let ChargeAmount = 0;

    // Checking if transaction is local or international
    // if the CurrencyCountry and payment country are the same
    // it is a local(LOCL) transaction and if not it is an
    // international(INTL) transaction
    if (CurrencyCountry === Country) {
      // filtering out fees where fee_local is not designated 'LOCL' or '*'
      fees = fees.filter(
        (fee) => fee.fee_locale === "LOCL" || fee.fee_locale === "*"
      );
    } else {
      // filtering out fees where fee_local is not designated 'INTL' or '*'
      fees = fees.filter(
        (fee) => fee.fee_locale === "INTL" || fee.fee_locale === "*"
      );
    }

    // filter off fee entities that are same as the Type or '*'
    fees = fees.filter(
      (fee) => fee.fee_entity === Type || fee.fee_entity === "*"
    );

    // filter off by the entity property
    fees = fees.filter((fee) => {
      // if the fee entity is USSD
      // Remove items whose entity property is not same as Issuer from the request
      // or '*'
      if (fee.fee_entity === "USSD") {
        return fee.entity_property === Issuer || fee.entity_property === "*";
      } else {
        // Remove items whose entity property is not same as Brand from the request
        return fee.entity_property === Brand || fee.entity_property === "*";
      }
    });

    // checks if every value of fee_local is not '*'
    // if so, removes all fees where fee_locale is '*'
    if (!allIn(fees, "fee_locale")) {
      fees = fees.filter((fee) => fee.fee_locale !== "*");
    }

    // checks if every value fee_entity is not '*'
    // if so, removes all fees where fee_entity is '*'
    if (!allIn(fees, "fee_entity")) {
      fees = fees.filter((fee) => fee.fee_locale !== "*");
    }

    // checks if every value entity_property is not '*'
    // if so, removes all fees where entity_property is '*'
    if (!allIn(fees, "entity_property")) {
      fees = fees.filter((fee) => fee.fee_locale !== "*");
    }

    // checking to see if there are not applicable fees
    // returns an error when there is no applicable fee
    if (fees.length === 0) {
      sendError(res, {
        code: 404,
        message: "No fee configuration for USD transactions.",
      });
      return;
    }

    // gets the fee type
    const feeType = fees[0].fee_type;
    // gets the fee value
    const feeValue = fees[0].fee_value;
    // gets the fee id
    const feeId = fees[0].fee_id;

    // checks the fee type
    // applies the correct multiplier depending on the fee type
    if (feeType === "FLAT") {
      // Caluclate applied fee
      AppliedFeeValue += parseFloat(feeValue);
    } else if (feeType === "PERC") {
      // store in perc value variable
      let value = parseFloat(feeValue);
      // Caluclate applied fee
      AppliedFeeValue += (value / 100) * Amount;
    } else if (feeType === "FLAT_PERC") {
      // Split fee to get the flat fee and perc
      const divStr = feeValue.split(":");
      // store in flat fee variable
      const flatVal = parseFloat(divStr[0]);
      // store in perc value variable
      const percVal = parseFloat(divStr[1]);
      // Caluclate applied fee
      AppliedFeeValue += flatVal + (percVal / 100) * Amount;
    } else {
      // throw error for any other fee type
      sendError(res, {
        code: 400,
        message: `Unexpected error: Does not understand fee type ${feeType}`,
      });
    }

    // Round the applied fee value to a whole number
    AppliedFeeValue = Math.round(AppliedFeeValue);
    // check the bearsfee attriibute
    // if true the customer pays the charges and the applied fee is added to the transaction amount
    // if false ChargeAmount is the transaction amount
    if (BearsFee) {
      ChargeAmount = AppliedFeeValue + Amount;
    } else {
      ChargeAmount = Amount;
    }

    // object holding the response
    // AppliedFeeID: ID of the fee charge applied
    // AppliedFeeValue: applied fee value
    // ChargeAmount: charge amount
    // SettlementAmount: settlement amount
    let payload = {
      AppliedFeeID: feeId,
      AppliedFeeValue: AppliedFeeValue,
      ChargeAmount: ChargeAmount,
      SettlementAmount: ChargeAmount - AppliedFeeValue,
    };
    // returns response
    sendSuccess(res, payload, "HTTP 200 OK", 200);
  } catch (err) {
    console.log(err);
    sendError(res, {
      code: 400,
      message: `Unexpected error: Does not understand fee type`,
    });
  }
};

// Controller to get all data from db
exports.getDb = async (req, res) => {
  try {
    const results = db.getAll();
    console.log(results.fees.length, "sss");
    sendSuccess(res, results);
  } catch (err) {
    sendError(res, { message: "failure" });
  }
};
