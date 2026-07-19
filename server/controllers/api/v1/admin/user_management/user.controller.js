const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { Paginate } = require("../../../../../helper/common/utils");
const User = require("../../../../../models/User");
const Role = require("../../../../../models/Role");
const AccountDeletionRequest = require("../../../../../models/AccountDeletionRequest");
const bcrypt = require("bcrypt");

class UserController {
  async getAllCustomers(req, res) {
    try {
      const { search = "", status } = req.query;
      const customerRole = await Role.findOne({ slug: "customer" });
      const filter = { role_id: customerRole?._id };
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { contact_no: { $regex: search, $options: "i" } },
        ];
      }
      if (status !== undefined) filter.status = status === "true";

      return Paginate(User, { filter, sort: { createdAt: -1 }, populate: [{ path: "role_id", select: "name slug" }] }, req, res);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllEmployees(req, res) {
    try {
      const { search = "" } = req.query;
      const employeeRole = await Role.findOne({ slug: "employee" });
      const filter = { role_id: employeeRole?._id };
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      return Paginate(User, { filter, sort: { createdAt: -1 }, populate: [{ path: "role_id", select: "name slug" }] }, req, res);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllAdmins(req, res) {
    try {
      const { search = "", role_slug } = req.query;
      const roles = await Role.find({ slug: { $in: ["super_admin", "admin"] } });
      const roleIds = roles.map((r) => r._id);
      
      const filter = { role_id: { $in: roleIds } };
      
      // Filter by specific role if provided
      if (role_slug) {
        const specificRole = await Role.findOne({ slug: role_slug });
        if (specificRole) filter.role_id = specificRole._id;
      }
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      
      return Paginate(User, { filter, sort: { createdAt: -1 }, populate: [{ path: "role_id", select: "name slug" }] }, req, res);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async getById(req, res) {
    try {
      const user = await User.findById(req.params.id).populate("role_id", "name slug");
      if (!user) return Base.sendError(res, HTTPS.NOT_FOUND, "User not found");
      return Base.sendResponse(res, HTTPS.OK, user);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async createEmployee(req, res) {
    try {
      const { first_name, last_name, email, contact_no, address, govt_id, password } = req.body;

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return Base.sendError(res, HTTPS.CONFLICT, { email: "Email already exists" });

      const employeeRole = await Role.findOne({ slug: "employee" });
      if (!employeeRole) return Base.sendError(res, HTTPS.NOT_FOUND, "Employee role not found");

      const fullName = `${first_name.trim()} ${last_name.trim()}`;
      const newEmployee = new User({
        first_name: first_name.trim(),
        last_name:  last_name.trim(),
        name:       fullName,
        email:      email.toLowerCase().trim(),
        contact_no: contact_no || null,
        address:    address   || null,
        govt_id:    govt_id   || null,
        password,
        role_id:           employeeRole._id,
        is_email_verified: true,
      });

      await newEmployee.save();
      const populated = await User.findById(newEmployee._id).populate("role_id", "name slug");
      return Base.sendResponse(res, HTTPS.CREATED, populated, "Employee created successfully");
    } catch (error) {
      console.error("createEmployee error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async createAdmin(req, res) {
    try {
      const { first_name, last_name, email, contact_no, address, govt_id, password } = req.body;

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return Base.sendError(res, HTTPS.CONFLICT, { email: "Email already exists" });

      const adminRole = await Role.findOne({ slug: "admin" });
      if (!adminRole) return Base.sendError(res, HTTPS.NOT_FOUND, "Admin role not found");

      const fullName = `${first_name.trim()} ${last_name.trim()}`;
      const newAdmin = new User({
        first_name: first_name.trim(),
        last_name:  last_name.trim(),
        name:       fullName,
        email:      email.toLowerCase().trim(),
        contact_no: contact_no || null,
        address:    address   || null,
        govt_id:    govt_id   || null,
        password,
        role_id:           adminRole._id,
        is_email_verified: true,
      });

      await newAdmin.save();
      const populated = await User.findById(newAdmin._id).populate("role_id", "name slug");
      return Base.sendResponse(res, HTTPS.CREATED, populated, "Admin created successfully");
    } catch (error) {
      console.error("createAdmin error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async createCustomer(req, res) {
    try {
      const { first_name, last_name, email, contact_no, address, govt_id, password } = req.body;

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return Base.sendError(res, HTTPS.CONFLICT, { email: "Email already exists" });

      const customerRole = await Role.findOne({ slug: "customer" });
      if (!customerRole) return Base.sendError(res, HTTPS.NOT_FOUND, "Customer role not found");

      const fullName = `${first_name.trim()} ${last_name.trim()}`;
      const newCustomer = new User({
        first_name: first_name.trim(),
        last_name:  last_name.trim(),
        name:       fullName,
        email:      email.toLowerCase().trim(),
        contact_no: contact_no || null,
        address:    address   || null,
        govt_id:    govt_id   || null,
        password,
        role_id:           customerRole._id,
        is_email_verified: true,
      });

      await newCustomer.save();
      const populated = await User.findById(newCustomer._id).populate("role_id", "name slug");
      return Base.sendResponse(res, HTTPS.CREATED, populated, "Customer created successfully");
    } catch (error) {
      console.error("createCustomer error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async update(req, res) {
    try {
      const { first_name, last_name, contact_no, address, govt_id, status } = req.body;
      const user = await User.findById(req.params.id);
      if (!user) return Base.sendError(res, HTTPS.NOT_FOUND, "User not found");

      const updateData = {
        first_name: first_name?.trim() || user.first_name,
        last_name:  last_name?.trim()  || user.last_name,
        name:       first_name && last_name
                      ? `${first_name.trim()} ${last_name.trim()}`
                      : user.name,
        contact_no: contact_no ?? user.contact_no,
        address:    address    ?? user.address,
        govt_id:    govt_id    ?? user.govt_id,
        ...(status !== undefined && { status }),
      };

      const updated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true })
        .populate("role_id", "name slug");
      return Base.sendResponse(res, HTTPS.OK, updated, "User updated successfully");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async toggleBlock(req, res) {
    try {
      const user = await User.findById(req.params.id).populate("role_id", "slug");
      if (!user) return Base.sendError(res, HTTPS.NOT_FOUND, "User not found");

      // Super admins can never be blocked
      if (user.role_id?.slug === "super_admin") {
        return Base.sendError(res, HTTPS.FORBIDDEN, "Super Admin cannot be blocked");
      }

      await User.findByIdAndUpdate(req.params.id, { block_status: !user.block_status });
      return Base.sendResponse(res, HTTPS.OK, null, `User ${!user.block_status ? "blocked" : "unblocked"} successfully`);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return Base.sendError(res, HTTPS.NOT_FOUND, "User not found");

      // 1. Resolve any active AccountDeletionRequest for this customer
      //    so the unique partial index never conflicts on future operations.
      await AccountDeletionRequest.updateMany(
        {
          customer_id: user._id,
          status: { $in: ["pending", "reviewed", "approved"] },
        },
        {
          $set: {
            status:           "deleted",
            rejection_reason: "Account hard-deleted by admin",
          },
        }
      );

      // 2. Hard-delete the user document
      await User.findByIdAndDelete(req.params.id);

      return Base.sendResponse(res, HTTPS.OK, null, "Customer deleted successfully");
    } catch (error) {
      console.error("remove user error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, error.message);
    }
  }
}

module.exports = new UserController();
