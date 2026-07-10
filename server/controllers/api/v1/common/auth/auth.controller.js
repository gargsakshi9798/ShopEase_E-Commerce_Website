const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { IDS } = require("../../../../../helper/fix_ids");
const { GenerateOTP } = require("../../../../../helper/common/utils");
const { sendOTPEmail } = require("../../../../../helper/NodeMailer");
const User = require("../../../../../models/User");
const Role = require("../../../../../models/Role");

class AuthController {
  // ─── Admin Login ─────────────────────────────────────────────────────────────
  async adminLogin(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.trim(), status: true })
        .select("+password")
        .populate({
          path: "role_id",
          populate: { path: "permissions" },
        });

      if (!user) {
        return Base.sendError(res, HTTPS.NOT_FOUND, "Invalid credentials");
      }

      // Only allow admin, super_admin, employee
      const allowedRoles = ["admin", "super_admin", "employee"];
      if (!allowedRoles.includes(user.role_id?.slug)) {
        return Base.sendError(res, HTTPS.FORBIDDEN, "Access denied");
      }

      const isMatch = await bcrypt.compare(password.trim(), user.password);
      if (!isMatch) {
        return Base.sendError(res, HTTPS.NOT_ACCEPTABLE, "Incorrect password");
      }

      const permissionIds =
        user.role_id?.permissions?.map((p) => p.permission_id) || [];

      const token = jwt.sign(
        {
          user: user._id,
          name: user.name,
          email: user.email,
          role_id: user.role_id?._id,
          role: user.role_id?.slug,
          role_name: user.role_id?.name,
          permissions: permissionIds,
          user_type: user.role_id?.slug,
        },
        process.env.SECRETKEY,
        { expiresIn: process.env.JWT_EXPIRE || "365d" }
      );

      // Update last login
      await User.findByIdAndUpdate(user._id, { last_login: new Date() });

      const data = {
        token,
        role: user.role_id?.name,
        role_slug: user.role_id?.slug,
        permissions: permissionIds,
        name: user.name,
        email: user.email,
        profile_image: user.profile_image,
      };

      return Base.sendResponse(res, HTTPS.OK, data, "Login successful");
    } catch (error) {
      console.error("adminLogin error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // ─── Get Admin Details ────────────────────────────────────────────────────────
  async adminDetails(req, res) {
    try {
      const user = await User.findById(req.user.user).populate({
        path: "role_id",
        populate: { path: "permissions" },
      });

      if (!user) {
        return Base.sendError(res, HTTPS.NOT_FOUND, "User not found");
      }

      const permissionIds =
        user.role_id?.permissions?.map((p) => p.permission_id) || [];

      const data = {
        _id: user._id,
        name: user.name,
        email: user.email,
        contact_no: user.contact_no,
        profile_image: user.profile_image,
        role: user.role_id?.name,
        role_slug: user.role_id?.slug,
        role_id: user.role_id?._id,
        permissions: permissionIds,
      };

      return Base.sendResponse(res, HTTPS.OK, data);
    } catch (error) {
      console.error("adminDetails error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // ─── Customer Register ────────────────────────────────────────────────────────
  async customerRegister(req, res) {
    try {
      const { name, email, contact_no, password } = req.body;

      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return Base.sendError(res, HTTPS.CONFLICT, {
          email: "Email already registered",
        });
      }

      const customerRole = await Role.findOne({ slug: "customer" });
      if (!customerRole) {
        return Base.sendError(
          res,
          HTTPS.INTERNAL_SERVER_ERROR,
          "Customer role not configured"
        );
      }

      const otp = GenerateOTP(6);
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      const newUser = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        contact_no: contact_no?.trim(),
        password,
        role_id: customerRole._id,
        email_otp: otp,
        email_otp_expires: otpExpires,
        is_email_verified: false,
      });

      await newUser.save();

      // Send verification email (non-blocking)
      sendOTPEmail(email, otp, "verification").catch(console.error);

      return Base.sendResponse(
        res,
        HTTPS.CREATED,
        { email },
        "Registration successful. Please verify your email."
      );
    } catch (error) {
      console.error("customerRegister error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // ─── Verify Email OTP ─────────────────────────────────────────────────────────
  async verifyEmailOTP(req, res) {
    try {
      const { email, otp } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() })
        .select("+email_otp +email_otp_expires");

      if (!user) {
        return Base.sendError(res, HTTPS.NOT_FOUND, "User not found");
      }

      if (user.email_otp !== otp) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, { otp: "Invalid OTP" });
      }

      if (user.email_otp_expires < new Date()) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, {
          otp: "OTP has expired. Please request a new one.",
        });
      }

      await User.findByIdAndUpdate(user._id, {
        is_email_verified: true,
        email_otp: null,
        email_otp_expires: null,
      });

      return Base.sendResponse(res, HTTPS.OK, null, "Email verified successfully");
    } catch (error) {
      console.error("verifyEmailOTP error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // ─── Customer Login ───────────────────────────────────────────────────────────
  async customerLogin(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({
        email: email.toLowerCase(),
        status: true,
      })
        .select("+password")
        .populate("role_id");

      if (!user) {
        return Base.sendError(res, HTTPS.NOT_FOUND, {
          email: "No account found with this email",
        });
      }

      if (user.block_status) {
        return Base.sendError(
          res,
          HTTPS.FORBIDDEN,
          "Your account has been blocked. Contact support."
        );
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return Base.sendError(res, HTTPS.NOT_ACCEPTABLE, {
          password: "Incorrect password",
        });
      }

      const token = jwt.sign(
        {
          user: user._id,
          name: user.name,
          email: user.email,
          role: user.role_id?.slug,
          user_type: "customer",
        },
        process.env.SECRETKEY,
        { expiresIn: process.env.JWT_EXPIRE || "365d" }
      );

      await User.findByIdAndUpdate(user._id, { last_login: new Date() });

      return Base.sendResponse(
        res,
        HTTPS.OK,
        { token, name: user.name, email: user.email, profile_image: user.profile_image },
        "Login successful"
      );
    } catch (error) {
      console.error("customerLogin error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // ─── Forgot Password ──────────────────────────────────────────────────────────
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return Base.sendError(res, HTTPS.NOT_FOUND, {
          email: "No account found with this email",
        });
      }

      const otp = GenerateOTP(6);
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      await User.findByIdAndUpdate(user._id, {
        reset_password_otp: otp,
        reset_password_otp_expires: otpExpires,
      });

      sendOTPEmail(email, otp, "reset").catch(console.error);

      return Base.sendResponse(
        res,
        HTTPS.OK,
        null,
        "Password reset OTP sent to your email"
      );
    } catch (error) {
      console.error("forgotPassword error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // ─── Reset Password ───────────────────────────────────────────────────────────
  async resetPassword(req, res) {
    try {
      const { email, otp, new_password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() })
        .select("+reset_password_otp +reset_password_otp_expires +password");

      if (!user) {
        return Base.sendError(res, HTTPS.NOT_FOUND, "User not found");
      }

      if (user.reset_password_otp !== otp) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, { otp: "Invalid OTP" });
      }

      if (user.reset_password_otp_expires < new Date()) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, {
          otp: "OTP has expired. Please request a new one.",
        });
      }

      const hashed = await bcrypt.hash(new_password, 10);

      await User.findByIdAndUpdate(user._id, {
        password: hashed,
        reset_password_otp: null,
        reset_password_otp_expires: null,
      });

      return Base.sendResponse(
        res,
        HTTPS.OK,
        null,
        "Password reset successful"
      );
    } catch (error) {
      console.error("resetPassword error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // ─── Change Password ──────────────────────────────────────────────────────────
  async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;

      const user = await User.findById(req.user.user).select("+password");
      if (!user) {
        return Base.sendError(res, HTTPS.NOT_FOUND, "User not found");
      }

      const isMatch = await bcrypt.compare(current_password, user.password);
      if (!isMatch) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, {
          current_password: "Current password is incorrect",
        });
      }

      const hashed = await bcrypt.hash(new_password, 10);
      await User.findByIdAndUpdate(user._id, { password: hashed });

      return Base.sendResponse(res, HTTPS.OK, null, "Password changed successfully");
    } catch (error) {
      console.error("changePassword error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new AuthController();
