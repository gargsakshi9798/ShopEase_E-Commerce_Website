const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, trim: true, default: null },
    last_name:  { type: String, trim: true, default: null },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    contact_no: { type: String, trim: true },
    address:    { type: String, trim: true, default: null },
    govt_id:    { type: String, trim: true, default: null }, // Aadhar / Passport / etc.
    password: { type: String, required: true, select: false },
    show_password: { type: String, select: false },
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    profile_image: { type: String, default: null },
    is_email_verified: { type: Boolean, default: false },
    email_otp: { type: String, select: false },
    email_otp_expires: { type: Date, select: false },
    reset_password_otp: { type: String, select: false },
    reset_password_otp_expires: { type: Date, select: false },
    status: { type: Boolean, default: true },
    block_status: { type: Boolean, default: false },
    last_login: { type: Date, default: null },
    google_id: { type: String, default: null },
    refresh_token: { type: String, select: false },
  },
  {
    timestamps: true,
  }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
