const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Send OTP Email ───────────────────────────────────────────────────────────
const sendOTPEmail = async (userEmail, otp, purpose = "verification") => {
  try {
    const subject =
      purpose === "reset"
        ? "ShopEase - Password Reset OTP"
        : "ShopEase - Email Verification OTP";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">ShopEase</h1>
          <p style="color: #e0e7ff; margin: 5px 0 0 0;">Enterprise E-Commerce Platform</p>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b; margin-top: 0;">${purpose === "reset" ? "Password Reset" : "Email Verification"}</h2>
          <p style="color: #475569;">Your OTP for ${purpose} is:</p>
          <div style="background: #6366f1; color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 14px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `ShopEase <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error("sendOTPEmail error:", error);
    return false;
  }
};

// ─── Order Confirmation Email ─────────────────────────────────────────────────
const sendOrderConfirmationEmail = async (userEmail, orderData) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">ShopEase</h1>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e293b;">Order Confirmed! 🎉</h2>
          <p>Your order <strong>#${orderData.order_number}</strong> has been placed successfully.</p>
          <p>Total Amount: <strong>₹${orderData.total_amount}</strong></p>
          <p>Estimated Delivery: <strong>${orderData.estimated_delivery || "3-5 business days"}</strong></p>
          <p>Thank you for shopping with ShopEase!</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `ShopEase <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `Order Confirmed - #${orderData.order_number}`,
      html,
    });

    return true;
  } catch (error) {
    console.error("sendOrderConfirmationEmail error:", error);
    return false;
  }
};

// ─── Generic Email ────────────────────────────────────────────────────────────
const sendMail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `ShopEase <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("sendMail error:", error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendOrderConfirmationEmail,
  sendMail,
};
