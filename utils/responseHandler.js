// Handles success responses
const sendSuccess = (response, data = {}, message = "success", code = 200) => {
  const resp = {
    data,
    message,
    statuscode: code,
  };
  return response.status(code).json(resp);
};

// Handles error responses
const sendError = (response, error) => {
  const resp = {
    // status: `HTTP ${error.code} NOT FOUND`,
    Error: error.message,
  };
  return response.status(error.code || 400).json(resp);
};

module.exports = { sendSuccess, sendError };
