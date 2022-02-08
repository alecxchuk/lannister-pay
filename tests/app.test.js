const request = require("supertest");
const makeApp = require("../app");
const {
  invalidFeeConfig,
  notDefined,
  invalidPayment,
  invalidType,
} = require("../utils/responseMessages");

// mock function using jest
const get = jest.fn();
const set = jest.fn();

const app = makeApp({ get, set });
const {
  bodyData,
  computeTestData,
  testConfigSpecs,
  expectedFeePayload,
  sampleDb,
  computeTestResponses,
  computeTestRequests,
  feeSpecProps,
  feeSpecData,
  compBodyStrings,
} = require("./test_helper");

describe("/fees", () => {
  beforeEach(() => {
    // resets the set function before each test
    set.mockReset();
  });
  describe("When giving a valid fee configuration spec", () => {
    // should save configuration spec to the database
    test("should save configuration spec to the database", async () => {
      await request(app).post("/fees").send(testConfigSpecs);
      // set function should be called only once
      expect(set.mock.calls.length).toBe(1);
      // first parameter when set is called first time should be 'fees'
      expect(set.mock.calls[0][0]).toBe("fees");
      // second parameter when set is called the first time should be an array
      expect(Array.isArray(set.mock.calls[0][1])).toBe(true);
      // second parameter when set is called the first time should be a non empty array
      expect(set.mock.calls[0][1].length).toBeGreaterThan(0);
      //
      expect(set.mock.calls[0][1]).toEqual(
        expect.arrayContaining([expect.objectContaining(expectedFeePayload)])
      );
    });

    // should return response with the configuration spec
    // should return a response with 200 status code
    test("should respond with a 200 status code", async () => {
      const response = await request(app).post("/fees").send({
        FeeConfigurationSpec: "LNPY1221 NGN * *(*) : APPLY PERC 1.4",
      });
      expect(response.statusCode).toBe(200);
    });

    // should specify json in the content type header
    test("should specify json in the content type header", async () => {
      const response = await request(app).post("/fees").send({
        FeeConfigurationSpec: "LNPY1221 NGN * *(*) : APPLY PERC 1.4",
      });
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
    });

    // shouls specify json in the content type header
    test("response has status ok", async () => {
      const response = await request(app).post("/fees").send({
        FeeConfigurationSpec: "LNPY1221 NGN * *(*) : APPLY PERC 1.4",
      });
      expect(response.body.status).toBe("ok");
    });
  });

  describe("When giving no fee configuration spec", () => {
    // should respond with a status code of 400
    test("should respond with a 400 status code", async () => {
      const response = await request(app).post("/fees").send({});
      expect(response.statusCode).toBe(400);
      expect(response.body.Error).toBe(
        "The property FeeConfigurationSpec is not defined"
      );
    });
  });
  describe("When giving a fee configuration that is not of type string", () => {
    // should respond with a status code of 400
    test("should respond with a 400 status code", async () => {
      const response = await request(app)
        .post("/fees")
        .send({ FeeConfigurationSpec: [] });
      expect(response.statusCode).toBe(400);
      expect(response.body.Error).toBe(
        "Fee configuration spec should be a string"
      );
    });
  });

  describe("When given an invalid fee configuration spec", () => {
    test("should respond with a 400 status code and error", async () => {
      const response = await request(app).post("/fees").send({
        FeeConfigurationSpec: "",
      });
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        Error: invalidFeeConfig, //"Invalid fee configuration spec",
      });
    });
    test("should respond with a 400 status code and error", async () => {
      const response = await request(app).post("/fees").send({
        FeeConfigurationSpec: "LNPY1221 NGN * *(*) :APPLY PERC 1.4",
      });
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        Error: invalidFeeConfig, //"Invalid Fee configuration specs",
      });
    });
  });

  describe("When given an invalid fee type", () => {
    test("should respond with a 400 status code and error", async () => {
      const response = await request(app).post("/fees").send({
        FeeConfigurationSpec: "LNPY1221 NGN * *(*) : APPLY PERCS 1.4",
      });
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        Error: "PERCS is not a valid fee type", // "PERCS is not recognized as a valid fee type",
      });
    });
  });

  describe("When given an invalid fee entity", () => {
    test("should respond with a 400 status code and error", async () => {
      const response = await request(app).post("/fees").send({
        FeeConfigurationSpec: "LNPY1221 NGN * ESUSU(*) : APPLY PERC 1.4",
      });
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        Error: "ESUSU is not a valid fee entity",
      });
    });
  });

  describe("When given an invalid fee locale", () => {
    test("should respond with a 400 status code and error", async () => {
      const response = await request(app).post("/fees").send({
        FeeConfigurationSpec:
          "LNPY1221 NGN VILLAGE CREDIT-CARD(*) : APPLY PERC 1.4",
      });
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        Error: "VILLAGE is not a valid fee locale",
      });
    });
  });

  describe("When given an invalid fee value for FLAT_PERC", () => {
    const specs = [":1.4", "50:", "50:x", "x:1.4", "50:x"];
    for (let spec of specs) {
      let specReq = `LNPY1221 NGN * CREDIT-CARD(*) : APPLY FLAT_PERC ${spec}`;
      let specRes = `${spec} is not a valid FLAT_PERC fee value`;
      test("should respond with a 400 status code and error", async () => {
        const response = await request(app).post("/fees").send({
          FeeConfigurationSpec: specReq,
        });
        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
          Error: specRes,
        });
      });
    }
  });
});

describe("/compute-transaction-fee", () => {
  // the functions within get called before each test
  beforeEach(() => {
    // resets the set function before each test
    get.mockReset();
    // sets a mock return value for the getAll mock function
    get.mockReturnValue(sampleDb.fees);
  });

  describe("When giving the Amount, Currency, CurrencyCountry, PaymentEntity, Customer,Issuer, Brand, Type, Country", () => {
    // should get fees configurations from database
    test("should get configuration spec from the database", async () => {
      await request(app)
        .post("/compute-transaction-fee")
        .send(computeTestRequests[1]);
      // getall function should be called only once
      expect(get.mock.calls.length).toBe(1);
    });

    test("should respond with a json object containg the AppliedFeeId, AppliedFeeValue,ChargeAmount,SettleAmount", async () => {
      for (let i = 0; i < 2; i++) {
        const response = await request(app)
          .post("/compute-transaction-fee")
          .send(computeTestRequests[i]);
        expect(response.body).toEqual(computeTestResponses[i]);
      }
    });

    test("should respond with a json object containing error when no matching fee config found", async () => {
      const response = await request(app)
        .post("/compute-transaction-fee")
        .send(computeTestRequests[2]);
      expect(response.body).toStrictEqual(computeTestResponses[2]);
    });

    test("should respond with a 200 status code", async () => {
      const response = await request(app)
        .post("/compute-transaction-fee")
        .send(computeTestRequests[0]);
      expect(response.statusCode).toBe(200);
    });

    test("should specify json in the content type header", async () => {
      const response = await request(app)
        .post("/compute-transaction-fee")
        .send(computeTestRequests[0]);
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
    });

    test("response has AppliedFeeID", async () => {
      const response = await request(app)
        .post("/compute-transaction-fee")
        .send(computeTestRequests[0]);
      expect(response.body.AppliedFeeID).toBeDefined();
    });

    test("response type of AppliedFeeID should be string", async () => {
      const response = await request(app)
        .post("/compute-transaction-fee")
        .send(computeTestRequests[0]);
      expect(typeof response.body.AppliedFeeID).toBe("string");
    });

    test("response has AppliedFeeValue", async () => {
      const response = await request(app)
        .post("/compute-transaction-fee")
        .send(computeTestRequests[0]);
      expect(response.body.AppliedFeeValue).toBeDefined();
    });
    test("response type of AppliedFeeValue should be number", async () => {
      const response = await request(app)
        .post("/compute-transaction-fee")
        .send(computeTestRequests[0]);
      expect(typeof response.body.AppliedFeeValue).toBe("number");
    });

    test("response has ChargeAmount", async () => {
      const response = await request(app)
        .post("/compute-transaction-fee")
        .send(computeTestRequests[0]);
      expect(response.body.ChargeAmount).toBeDefined();
    });

    test("response type of ChargeAmount should be number", async () => {
      const response = await request(app)
        .post("/compute-transaction-fee")
        .send(computeTestRequests[0]);
      expect(typeof response.body.ChargeAmount).toBe("number");
    });

    test("response has SettlementAmount", async () => {
      const response = await request(app)
        .post("/compute-transaction-fee")
        .send(computeTestRequests[0]);
      expect(response.body.SettlementAmount).toBeDefined();
    });

    test("response type of SettlementAmount should be number", async () => {
      const response = await request(app)
        .post("/compute-transaction-fee")
        .send(computeTestRequests[0]);
      expect(typeof response.body.SettlementAmount).toBe("number");
    });
  });

  describe("When no payment transaction is given", () => {
    test("should respond with a 400 status code", async () => {
      const response = await request(app)
        .post("/compute-transaction-fee")
        .send({});
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        Error: invalidPayment,
      });
    });
  });

  describe("When the Amount, Currency, CurrencyCountry, PaymentEntity, Customer,Issuer, Brand, Type, Country is missing", () => {
    test("should respond with a 400 status code", async () => {
      for (const body of bodyData) {
        const index = bodyData.indexOf(body);
        const response = await request(app)
          .post("/compute-transaction-fee")
          .send(body);
        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
          Error: notDefined(compBodyStrings[index]),
        });
      }
    });
  });
  describe("When given an amount that is not a number", () => {
    test("should respond with a 400 status code", async () => {
      const response = await request(app)
        .post("/compute-transaction-fee")
        .send({
          ID: "91204",
          Amount: "aaa",
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
        });
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        Error: invalidType("Amount", "number"),
      });
    });
  });
  describe("When given currency or currency country that is not a string", () => {
    test("should respond with a 400 status code", async () => {
      const body = [
        {
          ID: "91204",
          Amount: 5000,
          Currency: 111,
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
          ID: "91204",
          Amount: 5000,
          Currency: "NGN",
          CurrencyCountry: 222,
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
      ];
      for (let prop of body) {
        const index = body.indexOf(prop);
        let err = invalidType(
          index === 0 ? "Currency" : "CurrencyCountry",
          "string"
        );
        const response = await request(app)
          .post("/compute-transaction-fee")
          .send(prop);
        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
          Error: err,
        });
      }
    });
  });
  describe("When given payment entity or customer that is not a string", () => {
    test("should respond with a 400 status code", async () => {
      const body = [
        {
          ID: "91204",
          Amount: 5000,
          Currency: "NGN",
          CurrencyCountry: "NG",
          Customer: "lol",

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
          ID: "91204",
          Amount: 5000,
          Currency: "NGN",
          CurrencyCountry: "NG",
          Customer: {
            ID: 4211232,
            EmailAddress: "anonimized292200@anon.io",
            FullName: "Wenthorth Scoffield",
            BearsFee: false,
          },
          PaymentEntity: "lol",
        },
      ];
      for (let prop of body) {
        const index = body.indexOf(prop);
        let err = invalidType(
          index === 0 ? "Customer" : "PaymentEntity",
          "object"
        );
        const response = await request(app)
          .post("/compute-transaction-fee")
          .send(prop);
        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
          Error: err,
        });
      }
    });
  });

  describe("When given a transaction  that does not match", () => {
    test("should respond with a 404 status code", async () => {
      const body = [
        {
          ID: "91204",
          Amount: 5000,
          Currency: "USD",
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
          ID: "91204",
          Amount: 5000,
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
            Type: "WALLET-ID",
            Country: "NG",
          },
        },
      ];
      for (let prop of body) {
        const index = body.indexOf(prop);
        let err = index === 0 ? "USD" : "WALLET-ID";

        const response = await request(app)
          .post("/compute-transaction-fee")
          .send(prop);
        expect(response.statusCode).toBe(404);
        expect(response.body).toMatchObject({
          Error: `No fee configuration for ${err} transactions.`,
        });
      }
    });
  });
});
