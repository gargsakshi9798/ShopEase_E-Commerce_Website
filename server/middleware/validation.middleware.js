const Base = require("../helper/exception_handling/index.js");
const { HTTPS } = require("../helper/https-status-codes/https-status-codes");
const { Validate } = require("../helper/validations");

const ValidationMiddleware = (req, res, next) => {
  try {
    return Validate(req, res, next);
  } catch (error) {
    return Base.sendError(res, HTTPS.BAD_REQUEST, error.message);
  }
};

module.exports = { ValidationMiddleware };
