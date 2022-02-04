// const db = require("../db/db_helper");
const { allIn } = require("../utils/check_array");
const { sendSuccess, sendError } = require("../utils/responseHandler");

// Controller for fees endpoint
exports.fees = function (db) {
  return (req, res) => {
    try {
      // destruction req.body
      // const { FeeConfigurationSpec } = req.body;
      // // arr for the payload
      // let payloadList = [];
      // // split response to get each fee value
      // const sampleList = FeeConfigurationSpec.split("\n");

      // // map the list to
      // sampleList.map((sample) => {
      //   const payload = sample.split(" ");
      //   if (payload.length !== 8) {
      //     return;
      //   }
      //   const fee_entity = payload[3].split("(")[0];

      //   // entity property
      //   const entity_property = payload[3].split("(")[1].split(")")[0];

      //   // payload
      //   const testPayload = {
      //     fee_id: payload[0].trim(),
      //     fee_currency: payload[1].trim(),
      //     fee_locale: payload[2].trim(),
      //     fee_entity: fee_entity.trim(),
      //     entity_property: entity_property.trim(),
      //     fee_type: payload[6].trim(),
      //     fee_value: payload[7].trim(),
      //   };
      //   payloadList.push(testPayload);
      // });

      // if (payloadList.length === 0) {
      //   throw new Error("Invalid Fee Configuration spec");
      // }
      // save to db
      // db.set("fees", payloadList);

      // success response
      return res.status(200).json({
        status: "okse",
      });
    } catch (err) {
      // error
      sendError(res, { message: "failure" });
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
      const { ID, Issuer, Brand, Number, SixID, Type, Country } = PaymentEntity;
      // Deconstruct the customer object to get;
      const { BearsFee } = Customer;

      // relevant properties from request body
      const relevantProps = [
        "Amount",
        "Currency",
        "CurrencyCountry",
        "PaymentEntity",
        "Customer",
      ];
      // sub properties for payment
      const paymentProps = [
        "ID",
        "Issuer",
        "Number",
        "SixID",
        "Brand",
        "Type",
        "Country",
      ];
      // sub properties for customer
      const customerProps = ["BearsFee"];

      // possible fee entities
      const feeEntityProps = [
        "CREDIT-CARD",
        "DEBIT-CARD",
        "BANK-ACCOUNT",
        "USSD",
        "WALLET-ID",
      ];

      // Checking to make sure req body contains all the relevant props
      for (let prop of relevantProps) {
        if (!req.body.hasOwnProperty(prop)) {
          throw new Error(`The property ${prop} is not defined`);
        }
        // checking if the payment entity object contains all the required props
        if (prop === "PaymentEntity") {
          for (let payProp of paymentProps) {
            if (!req.body.PaymentEntity.hasOwnProperty(payProp)) {
              throw new Error(
                `The property '${payProp}' in 'PaymentEntity' is not defined`
              );
            }
          }
        } else if (prop === "Customer") {
          // checking if the customer object contains all the required props
          for (let customerProp of customerProps) {
            if (!req.body.Customer.hasOwnProperty(customerProp)) {
              throw new Error(
                `The property '${customerProp}' in 'Customer' is not defined`
              );
            }
          }
        }
      }

      // retrieve the fees configuration specs from the database
      const feeList = db.get("fees");
      // Throw error if there is no valid fee configuration spec
      if (feeList.length === 0) {
        throw new Error("No fees configuration specs found");
      }

      // empty fees list for filtering
      // this would hold the final fee configuration after filtering is done
      // let fees = [];
      let fees = feeList
        .filter((fee) => fee.fee_currency === Currency)
        .filter((fee) => {
          // Checking if transaction is local or international
          // if the CurrencyCountry and payment country are the same
          // it is a local(LOCL) transaction and if not it is an
          // international(INTL) transaction
          if (CurrencyCountry === Country) {
            // filtering out fees where fee_local is not designated 'LOCL' or '*'
            return fee.fee_locale === "LOCL" || fee.fee_locale === "*";
          } else {
            // filtering out fees where fee_local is not designated 'INTL' or '*'
            return fee.fee_locale === "INTL" || fee.fee_locale === "*";
          }
        })
        .filter((fee) => fee.fee_entity === Type || fee.fee_entity === "*") // filter off fee entities that are same as the Type or '*'

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
          .json({ Error: "No fee configuration for USD transactions." });
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
