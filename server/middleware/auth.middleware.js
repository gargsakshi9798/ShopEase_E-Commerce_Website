const jwt = require("jsonwebtoken");
const Base = require("../helper/exception_handling/index.js");
const { HTTPS } = require("../helper/https-status-codes/https-status-codes");

// ─── Admin / Employee Auth Middleware ────────────────────────────────────────
const AuthMiddleware = async (req, res, next) => {
  let token;

  if (req.headers && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return Base.sendError(res, HTTPS.UNAUTHORIZED, "Access token is required");
  }

  try {
    // Admin tokens are signed with SECRETKEY (admin secret)
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    req.user = decoded;
    req.user.ip = req.ip;
    next();
  } catch (error) {
    return Base.sendError(res, HTTPS.UNAUTHORIZED, error?.message);
  }
};

// ─── Customer Auth Middleware ─────────────────────────────────────────────────
const CustomerMiddleware = async (req, res, next) => {
  let token;

  if (req.headers && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return Base.sendError(res, HTTPS.UNAUTHORIZED, "Access token is required");
  }

  try {
    // Customer tokens are signed with CUSTOMER_SECRETKEY (separate secret).
    // Falls back to SECRETKEY so existing tokens remain valid during migration.
    const secret = process.env.CUSTOMER_SECRETKEY || process.env.SECRETKEY;
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    req.user.ip = req.ip;

    if (decoded.user_type !== "customer") {
      return Base.sendError(
        res,
        HTTPS.FORBIDDEN,
        "Only customers can access this route"
      );
    }

    next();
  } catch (error) {
    return Base.sendError(res, HTTPS.UNAUTHORIZED, error?.message);
  }
};

// ─── Optional Auth (public routes that can also detect logged-in user) ────────
const OptionalAuthMiddleware = async (req, res, next) => {
  let token;

  if (req.headers && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      // Try customer secret first, then admin secret
      const secret = process.env.CUSTOMER_SECRETKEY || process.env.SECRETKEY;
      try {
        req.user = jwt.verify(token, secret);
      } catch {
        req.user = jwt.verify(token, process.env.SECRETKEY);
      }
    } catch (error) {
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

module.exports = {
  AuthMiddleware,
  CustomerMiddleware,
  OptionalAuthMiddleware,
};
