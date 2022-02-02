const request = require("supertest");
const makeApp = require("../app");

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

    // test("should respond with a json object containg the user id", async () => {
    //     for (let i = 0; i < 10; i++) {
    //       createUser.mockReset()
    //       createUser.mockResolvedValue(i)
    //       const response = await request(app).post("/users").send({ username: "username", password: "password" })
    //       expect(response.body.userId).toBe(i)
    //     }
    //   })

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
    });
  });

  describe("When giving an invalid fee configuration spec", () => {
    test("should respond with a 400 status code", async () => {
      const response = await request(app).post("/fees").send({
        FeeConfigurationSpec: "",
      });
      expect(response.statusCode).toBe(400);
    });
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

  describe("When the Amount, Currency, CurrencyCountry, PaymentEntity, Customer,Issuer, Brand, Type, Country is missing", () => {
    test("should respond with a 400 status code", async () => {
      for (const body of bodyData) {
        const response = await request(app)
          .post("/compute-transaction-fee")
          .send(body);
        expect(response.statusCode).toBe(400);
      }
    });
  });
});
