const Base = require("../helper/exception_handling/index.js");
const { HTTPS } = require("../helper/https-status-codes/https-status-codes");
const User = require("../models/User");
const Role = require("../models/Role");

const PermissionMiddleware = (permissionId) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.user).populate({
        path: "role_id",
        populate: { path: "permissions" },
      });

      if (!user) {
        return Base.sendError(res, HTTPS.NOT_FOUND, "User not found");
      }

      // Super admin has all permissions
      if (user.role_id?.slug === "super_admin") {
        return next();
      }

      const permissionIds = user.role_id?.permissions?.map(
        (p) => p.permission_id
      ) || [];

      if (permissionIds.includes(Number(permissionId))) {
        next();
      } else {
        return Base.sendError(
          res,
          HTTPS.FORBIDDEN,
          "You do not have permission to perform this action"
        );
      }
    } catch (error) {
      console.error("PermissionMiddleware error:", error);
      return Base.sendError(res, HTTPS.FORBIDDEN, error.message);
    }
  };
};

module.exports = { PermissionMiddleware };
