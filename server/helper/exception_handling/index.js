const { HTTPS } = require("../https-status-codes/https-status-codes");

class BaseController {
  // Send a successful response
  sendResponse(res, HTTP = HTTPS.OK, result, message) {
    const response = {
      success: true,
      data: result,
      code: HTTP.code,
      message: message || HTTP.message,
    };
    return res.status(HTTP.code).json(response);
  }

  // Send an error response
  sendError(res, HTTP = HTTPS.BAD_REQUEST, errors) {
    const response = {
      success: false,
      code: HTTP.code,
      message: HTTP.message,
      errors: errors,
    };
    return res.status(HTTP.code).json(response);
  }
}

const Base = new BaseController();
module.exports = Base;
