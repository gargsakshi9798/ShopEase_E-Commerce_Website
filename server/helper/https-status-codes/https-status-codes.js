const HTTPS = {
  // Successful responses (200–299)
  OK: { code: 200, message: "OK" },
  CREATED: { code: 201, message: "Created" },
  ACCEPTED: { code: 202, message: "Accepted" },
  NO_CONTENT: { code: 204, message: "No Content" },

  // Client error responses (400–499)
  BAD_REQUEST: { code: 400, message: "Bad Request" },
  UNAUTHORIZED: { code: 401, message: "Unauthorized" },
  PAYMENT_REQUIRED: { code: 402, message: "Payment Required" },
  FORBIDDEN: { code: 403, message: "Forbidden" },
  NOT_FOUND: { code: 404, message: "Not Found" },
  METHOD_NOT_ALLOWED: { code: 405, message: "Method Not Allowed" },
  CONFLICT: { code: 409, message: "Conflict" },
  ALREADY_REPORTED: { code: 208, message: "Already Exists" },
  UNPROCESSABLE_ENTITY: { code: 422, message: "Unprocessable Entity" },
  TOO_MANY_REQUESTS: { code: 429, message: "Too Many Requests" },

  // Server error responses (500–599)
  INTERNAL_SERVER_ERROR: { code: 500, message: "Internal Server Error" },

  // Custom
  INVALIDOTP: { code: 400, message: "Invalid OTP" },
  OTPVERIFIED: { code: 200, message: "OTP Verified" },
  NOT_ACCEPTABLE: { code: 406, message: "Not Acceptable" },
};

module.exports = { HTTPS };
