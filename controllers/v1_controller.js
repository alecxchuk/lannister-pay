// const db = require("../db/db_helper");
const { allIn, noEntry } = require("../utils/check_array");
const { isString, isObject } = require("../utils/check_string");
const { sendError } = require("../utils/responseHandler");
const {
  invalidFeeConfig,
  feeConfigNotAString,
  undefinedFeeConfig,
  invalidValueMessage,
  invalidType,
  notDefined,
  noFeeConfig,
  invalidPayment,
} = require("../utils/responseMessages");
const { customerProps } = require("../utils/string_helpers.JS");
const { relevantProps } = require("../utils/string_helpers.JS");
const { paymentProps } = require("../utils/string_helpers.JS");
const { validFeeLocales } = require("../utils/string_helpers.JS");
const { validFeeEntities } = require("../utils/string_helpers.JS");
const { feeEntityProps } = require("../utils/string_helpers.JS");

// Controller for fees endpoint
exports.fees = function (db) {
  return (req, res) => {
    try {
      // destruction req.body
      const { FeeConfigurationSpec } = req.body;

      // Throw errow if feeConfiguration doesnt exist in the request body
      if (!req.body.hasOwnProperty("FeeConfigurationSpec")) {
        throw new Error(undefinedFeeConfig);
      }
      // Throw error if feeConfigurationSpec is not of type string
      if (typeof FeeConfigurationSpec !== "string") {
        throw new Error(feeConfigNotAString);
      }

      // arr for the payload
      let payloadList = [];
      // split response to get each fee value
      const sampleList = FeeConfigurationSpec.split("\n");

      // Throw error if feeConfigurationSpec is not of type string
      if (sampleList.length === 0) {
        throw new Error(invalidFeeConfig);
      }

      // map the list to
      sampleList.map((sample) => {
        const payload = sample.split(" ");
        if (payload.length !== 8) {
          throw new Error(invalidFeeConfig);
        }

        const fee_id = payload[0].trim();
        const fee_currency = payload[1].trim();
        const fee_locale = payload[2].trim();

        // Fee entity
        const fee_entity = payload[3].split("(")[0].trim();
        // entity property
        const entity_property = payload[3].split("(")[1].split(")")[0].trim();
        const fee_type = payload[6].trim();
        const fee_value = payload[7].trim();

        // Throw an error if any property of the fee configuration is missing
        if (
          !fee_id ||
          !fee_currency ||
          !fee_locale ||
          !fee_entity ||
          !entity_property ||
          !fee_type ||
          !fee_value
        ) {
          throw new Error(invalidFeeConfig);
        }

        // Throw error if a fee entity is not supported
        if (!validFeeEntities.includes(fee_entity)) {
          throw new Error(invalidValueMessage(fee_entity, "fee entity"));
        }
        // Throw error if a fee_locale is not supported
        if (!validFeeLocales.includes(fee_locale)) {
          throw new Error(invalidValueMessage(fee_locale, "fee locale"));
        }

        // Checks if fee type is valid - FLAT, PERC OR FLAT_PERC
        if (
          !(
            fee_type === "PERC" ||
            fee_type === "FLAT_PERC" ||
            fee_type === "FLAT"
          )
        ) {
          throw new Error(invalidValueMessage(fee_type, "fee type"));
        }

        if (fee_type === "FLAT_PERC") {
          let str = fee_value.split(":");
          if (
            (str.length !== 2 && str[0]) ||
            (str[0].length === 0 && str[1]) ||
            str[1].length === 0
          ) {
            throw new Error(
              invalidValueMessage(fee_value, `${fee_type} fee value`)
            );
            // throw new Error(
            //   `${fee_type} cannot have ${fee_value} as fee value`
            // );
          }
          for (let num of str) {
            if (isNaN(num)) {
              throw new Error(
                invalidValueMessage(fee_value, "FLAT_PERC fee value")
              );
              // throw new Error(
              //   `${fee_type} cannot have ${fee_value} as fee value`
              // );
            }
          }
        }

        // Throw an error if PERC or FLAT have a fee value that is not numeric
        if (fee_type === "PERC" || fee_type === "FLAT") {
          if (isNaN(fee_value)) {
            throw new Error(
              invalidValueMessage(fee_value, `${fee_type} fee value`)
            );
          }
        }

        // payload
        const testPayload = {
          fee_id: fee_id,
          fee_currency: fee_currency,
          fee_locale: fee_locale,
          fee_entity: fee_entity,
          entity_property: entity_property,
          fee_type: fee_type,
          fee_value: fee_value,
        };
        if (
          testPayload &&
          Object.keys(testPayload).length === 0 &&
          Object.getPrototypeOf(testPayload) === Object.prototype
        ) {
          throw new Error(invalidFeeConfig);
        }

        payloadList.push(testPayload);
      });

      if (payloadList.length === 0) {
        throw new Error(invalidFeeConfig);
      }
      // save to db
      db.set("fees", payloadList);

      // success response
      return res.status(200).json({
        status: "ok",
      });
    } catch (err) {
      // error response
      sendError(res, { message: err.message });
    }
  };
};

// Controller for compute transaction fee endpoint
exports.computeTransactionFee = function (db) {
  return (req, res) => {
    try {
      // deconstruct the req body;
      const { Amount, Currency, CurrencyCountry, PaymentEntity, Customer } =
        req.body;
      // deconstructing the payment entity object to get
      // const { ID, Issuer, Brand, Number, SixID, Type, Country } = PaymentEntity;

      // Deconstruct the customer object to get;
      // const { BearsFee } = Customer;

      if (
        req.body &&
        Object.keys(req.body).length === 0 &&
        Object.getPrototypeOf(req.body) === Object.prototype
      ) {
        throw new Error(invalidPayment);
      }

      // Checking to make sure req body contains all the relevant props
      for (let prop of relevantProps) {
        if (!req.body.hasOwnProperty(prop)) {
          throw new Error(notDefined(prop));
        }
        // Throw error if amount property is not a number
        if (prop === "Amount" && isNaN(req.body[prop])) {
          // if (isNaN(req.body[prop])) {
          throw new Error(invalidType(prop, "number"));
          // }
        }
        // Throw error if currency or currencyCountry is not a string
        if (
          ["Currency", "CurrencyCountry"].includes(prop) &&
          !isString(req.body[prop])
        ) {
          throw new Error(invalidType(prop, "string"));
        }
        // Throw error if the customer or payment entity is not an object
        if (
          ["Customer", "PaymentEntity"].includes(prop) &&
          !isObject(req.body[prop])
        ) {
          // if (!isObject(req.body[prop])) {
          throw new Error(invalidType(prop, "object"));
          // }
        }

        // checking if the payment entity object contains all the required props
        if (prop === "PaymentEntity") {
          for (let payProp of paymentProps) {
            // Throw error if any required PaymentEntity prop is not defined
            if (!req.body.PaymentEntity.hasOwnProperty(payProp)) {
              throw new Error(notDefined(payProp));
            }
            // Throw error if ID and sixID properties are not numbers
            if (payProp === "ID" || payProp === "sixID") {
              if (isNaN(PaymentEntity[payProp])) {
                throw new Error(invalidType(`${prop} ${payProp}`, "number"));
              }
            } else if (
              ["Issuer", "Brand", "Number", "Type", "Country"].includes(payProp)
            ) {
              // Throw error if other properties are not strings
              if (typeof PaymentEntity[payProp] !== "string") {
                throw new Error(invalidType(`${prop} ${payProp}`, "string"));
              }
              if (
                payProp === "Type" &&
                !feeEntityProps.includes(PaymentEntity["Type"])
              ) {
                throw new Error(
                  invalidValueMessage(PaymentEntity["Type"], "fee entity")
                );
              }
            }
          }
        }
        if (prop === "Customer") {
          // checking if the customer object contains all the required props
          for (let customerProp of customerProps) {
            // Throw error if any required customer prop is not defined
            if (!req.body.Customer.hasOwnProperty(customerProp)) {
              throw new Error(notDefined(customerProp));
            }
            // Throw error if bears fee property is not a boolean
            if (typeof Customer[customerProp] !== "boolean") {
              throw new Error(
                invalidType(`${prop} ${customerProp}`, "boolean")
              );
            }
          }
        }
      }

      // retrieve the fees configuration specs from the database
      const feeList = db.get("fees");
      // Throw error if there is no valid fee configuration spec
      if (feeList.length === 0) {
        throw new Error(noFeeConfig);
      }
      let feeLocale = "";
      // Checking if transaction is local or international
      // if the CurrencyCountry and payment country are the same
      // it is a local(LOCL) transaction and if not it is an
      // international(INTL) transaction
      if (CurrencyCountry === PaymentEntity["Country"]) {
        feeLocale = "LOCL";
      } else {
        feeLocale = "INTL";
      }

      // Object holds fee_spec_property - payment_spec_property relation
      const filter_specs = [
        {
          fee_currency: Currency,
        },
        { fee_locale: feeLocale },
        { fee_entity: PaymentEntity["Type"] },
        { entity_property: PaymentEntity },
      ];

      for (let prop of filter_specs) {
        const entity = Object.keys(prop)[0];
        // Throw an error if no fee configuration matches a particular fee property
        if (noEntry(feeList, entity, prop[entity])) {
          return res.status(404).json({
            Error: `No fee configuration for ${prop[entity]} transactions.`,
          });
        }
      }

      // empty fees list for filtering
      // this would hold the final fee configuration after filtering is done
      // let fees = [];
      let fees = feeList
        .filter((fee) => fee.fee_currency === Currency)
        .filter((fee) => fee.fee_locale === feeLocale || fee.fee_locale === "*")
        .filter(
          (fee) =>
            fee.fee_entity === PaymentEntity["Type"] || fee.fee_entity === "*"
        ) // filter off fee entities that are same as the Type or '*'

        // Return the fee configuration that the entity property matches the value contained in the payment entity
        // or contains '*'
        .filter((fee) => {
          for (let item of paymentProps) {
            return (
              fee.entity_property.toString() ===
                PaymentEntity[item].toString() || fee.entity_property === "*"
            );
          }
        });

      fees = fees.filter((fee) => {
        // checks if every value of fee_local is not '*'
        // if so, removes all fees where fee_locale is '*'
        if (!allIn(fees, "fee_locale")) {
          return fee.fee_locale !== "*";
        }

        // checks if every value fee_entity is not '*'
        // if so, removes all fees where fee_entity is '*'
        if (!allIn(fees, "fee_entity")) {
          return fee.feeEntity !== "*";
        }

        // checks if every value entity_property is not '*'
        // if so, removes all fees where entity_property is '*'
        if (!allIn(fees, "entity_property")) {
          return fee.entity_property !== "*";
        }
        return fee;
      });
      // local variable storing the applied fee value
      let AppliedFeeValue = 0;
      // local variable storing the charge amount
      let ChargeAmount = 0;

      if (fees.length === 0) {
        return res
          .status(404)
          .json({ Error: "No fee configuration for this transaction." });
      }

      // gets the fee type
      const feeType = fees[0].fee_type;
      // gets the fee value
      const feeValue = fees[0].fee_value;
      // gets the fee id
      const feeId = fees[0].fee_id;

      // Throw error if no fee type in fee configuration
      if (!feeType) {
        throw new Error(noValueFoundInFeeConfigError("fee type"));
      }
      // Throw error if no fee value in fee configuration
      if (!feeValue) {
        throw new Error(noValueFoundInFeeConfigError("fee value"));
      }
      // Throw error if no fee id in fee configuration
      if (!feeId) {
        throw new Error(noValueFoundInFeeConfigError("fee id"));
      }

      if (["PERC", "FLAT"].includes(feeType) && isNaN(feeValue)) {
        throw new Error(invalidType(feeType, "number"));
      }

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
        // Throw error if fee_values are not numeric
        if (isNaN(divStr[0]) || isNaN(divStr[1])) {
          throw new Error(invalidType(feeType, "number"));
        }
        // store in flat fee variable
        const flatVal = parseFloat(divStr[0]);
        // store in perc value variable
        const percVal = parseFloat(divStr[1]);

        // Calculate applied fee
        AppliedFeeValue += flatVal + (percVal / 100) * Amount;
      } else {
        // throw error for any other fee type
        throw new Error(invalidValueMessage(feeType, "fee type"));
        // sendError(res, {
        //   code: 400,
        //   message: `Unexpected error: Does not understand fee type ${feeType}`,
        // });
      }

      // Round the applied fee value to a whole number
      AppliedFeeValue = Math.round(AppliedFeeValue);
      // check the bearsfee attriibute
      // if true the customer pays the charges and the applied fee is added to the transaction amount
      // if false ChargeAmount is the transaction amount
      if (Customer["BearsFee"]) {
        ChargeAmount = AppliedFeeValue + Amount;
      } else {
        ChargeAmount = Amount;
      }

      // object holding the response
      let payload = {
        AppliedFeeID: feeId,
        AppliedFeeValue: AppliedFeeValue,
        ChargeAmount: ChargeAmount,
        SettlementAmount: ChargeAmount - AppliedFeeValue,
      };
      // returns response
      return res.status(200).json(payload);
    } catch (err) {
      sendError(res, err);
    }
  };
};

// Controller to get all data from db
exports.getDb = function (db) {
  return (req, res) => {
    try {
      const results = db.getAll();
      return res.status(200).json(results);
      // return sendSuccess(res, results);
    } catch (err) {
      sendError(res, { message: "failure" });
    }
  };
};
