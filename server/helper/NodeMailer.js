"use strict";

const nodemailer = require("nodemailer");
require("dotenv").config();

// ── SMTP guard ────────────────────────────────────────────────────────────────
const smtpReady =
  process.env.SMTP_USER &&
  process.env.SMTP_USER !== "your_email@gmail.com" &&
  process.env.SMTP_PASS &&
  process.env.SMTP_PASS !== "your_app_password";

const transporter = smtpReady
  ? nodemailer.createTransport({
      host:   process.env.SMTP_HOST || "smtp.gmail.com",
      port:   parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

// Always send FROM the authenticated Gmail account (Gmail rejects spoofed domains)
const getSender = () =>
  `${process.env.SMTP_FROM_NAME || "ShopEase"} <${process.env.SMTP_USER}>`;

// ── Responsive media queries ──────────────────────────────────────────────────
const MEDIA = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  body { margin:0; padding:0; background:#f0f4f8; }
  img  { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  table { border-collapse:collapse; }
  .wrapper   { width:100% !important; }
  .container { width:620px !important; }
  @media only screen and (max-width:640px) {
    .container      { width:100% !important; }
    .mob-full       { width:100% !important; display:block !important; }
    .mob-pad        { padding:20px 16px !important; }
    .mob-pad-sm     { padding:14px 16px !important; }
    .mob-stack td   { display:block !important; width:100% !important; }
    .mob-center     { text-align:center !important; }
    .mob-font-sm    { font-size:13px !important; }
    .mob-font-xs    { font-size:11px !important; }
    .mob-hero h2    { font-size:20px !important; }
    .mob-order-num  { font-size:16px !important; }
    .mob-total      { font-size:17px !important; }
    .mob-grand      { font-size:18px !important; }
    .mob-img        { width:52px !important; height:52px !important; }
    .mob-hide       { display:none !important; }
    .mob-btn a      { padding:13px 28px !important; font-size:14px !important; }
    .mob-badge td   { padding:8px 4px !important; }
    .mob-badge-icon { font-size:16px !important; }
    .mob-badge-txt  { font-size:10px !important; }
    .footer-links   { font-size:10px !important; }
  }
</style>`;

// ── Shared wrapper: branded header + dark footer ──────────────────────────────
const wrap = (body) => `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="format-detection" content="telephone=no"/>
  <title>ShopEase</title>
  ${MEDIA}
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:Inter,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<!-- Preheader (hidden) -->
<div style="display:none;font-size:1px;color:#f0f4f8;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
  ShopEase — Your order has been confirmed ✅
</div>

<!-- Outer wrapper -->
<table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation"
  style="background:#f0f4f8;padding:24px 8px;">
<tr><td align="center">

<!-- Container -->
<table class="container" width="620" cellpadding="0" cellspacing="0" role="presentation"
  style="width:620px;">

  <!-- ═══ HEADER ═══ -->
  <tr><td style="background:linear-gradient(135deg,#1d4ed8 0%,#4338ca 60%,#6d28d9 100%);border-radius:16px 16px 0 0;padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td style="padding:28px 32px 24px;">
          <!-- Logo row -->
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="vertical-align:middle;">
                <table cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="background:#ffffff;border-radius:10px;padding:8px 16px;display:inline-block;">
                      <span style="font-family:Inter,Arial,sans-serif;font-size:20px;font-weight:900;color:#1d4ed8;letter-spacing:-0.5px;">Shop</span><span style="font-family:Inter,Arial,sans-serif;font-size:20px;font-weight:900;color:#4338ca;">Ease</span>
                    </td>
                  </tr>
                  <tr><td style="padding-top:8px;">
                    <span style="font-family:Inter,Arial,sans-serif;color:#c7d2fe;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Premium E-Commerce</span>
                  </td></tr>
                </table>
              </td>
              <td align="right" style="vertical-align:middle;" class="mob-hide">
                <div style="background:rgba(255,255,255,0.12);border-radius:50%;width:52px;height:52px;text-align:center;line-height:52px;font-size:26px;">🛍️</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td></tr>
  <!-- END HEADER -->

  <!-- ═══ BODY SLOT ═══ -->
  ${body}
  <!-- END BODY SLOT -->

  <!-- ═══ FOOTER ═══ -->
  <tr><td style="background:#1e293b;border-radius:0 0 16px 16px;padding:28px 32px;" class="mob-pad-sm">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr><td align="center" style="padding-bottom:14px;">
        <p style="margin:0 0 4px;font-family:Inter,Arial,sans-serif;font-size:15px;font-weight:800;color:#f1f5f9;">ShopEase</p>
        <p style="margin:0;font-family:Inter,Arial,sans-serif;font-size:11px;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;">Premium E-Commerce Platform</p>
      </td></tr>
      <tr><td align="center" style="padding-bottom:12px;">
        <table cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding:0 8px;">
              <a href="mailto:support@shopease.com" style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#94a3b8;text-decoration:none;">📧 support@shopease.com</a>
            </td>
            <td style="color:#334155;font-size:12px;">|</td>
            <td style="padding:0 8px;">
              <a href="tel:18001234567" style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#94a3b8;text-decoration:none;">📞 1800-123-4567</a>
            </td>
          </tr>
        </table>
      </td></tr>
      <!-- Social icons -->
      <tr><td align="center" style="padding-bottom:14px;">
        <table cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding:0 4px;"><a href="#" style="display:inline-block;background:#1d4ed8;color:#fff;width:28px;height:28px;border-radius:6px;text-align:center;line-height:28px;font-size:12px;font-weight:700;text-decoration:none;font-family:Arial,sans-serif;">f</a></td>
            <td style="padding:0 4px;"><a href="#" style="display:inline-block;background:#0284c7;color:#fff;width:28px;height:28px;border-radius:6px;text-align:center;line-height:28px;font-size:12px;font-weight:700;text-decoration:none;font-family:Arial,sans-serif;">t</a></td>
            <td style="padding:0 4px;"><a href="#" style="display:inline-block;background:#be185d;color:#fff;width:28px;height:28px;border-radius:6px;text-align:center;line-height:28px;font-size:12px;font-weight:700;text-decoration:none;font-family:Arial,sans-serif;">in</a></td>
            <td style="padding:0 4px;"><a href="#" style="display:inline-block;background:#dc2626;color:#fff;width:28px;height:28px;border-radius:6px;text-align:center;line-height:28px;font-size:12px;font-weight:700;text-decoration:none;font-family:Arial,sans-serif;">▶</a></td>
          </tr>
        </table>
      </td></tr>
      <tr><td align="center">
        <p class="footer-links" style="margin:0;font-family:Inter,Arial,sans-serif;font-size:11px;color:#475569;line-height:1.8;">
          © ${new Date().getFullYear()} ShopEase. All rights reserved. &nbsp;·&nbsp;
          <a href="#" style="color:#6366f1;text-decoration:none;">Privacy Policy</a> &nbsp;·&nbsp;
          <a href="#" style="color:#6366f1;text-decoration:none;">Terms of Service</a> &nbsp;·&nbsp;
          <a href="#" style="color:#6366f1;text-decoration:none;">Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
  <!-- END FOOTER -->

</table><!-- end container -->
</td></tr>
</table><!-- end outer -->
</body>
</html>`;

// ── OTP Email ─────────────────────────────────────────────────────────────────
const sendOTPEmail = async (userEmail, otp, purpose = "verification") => {
  if (!transporter) { console.warn("[NodeMailer] SMTP not configured — skipping OTP email"); return false; }
  try {
    const isReset  = purpose === "reset";
    const subject  = isReset ? "ShopEase — Reset Your Password" : "ShopEase — Verify Your Email";
    const icon     = isReset ? "🔐" : "✉️";
    const iconBg   = isReset ? "#fef3c7" : "#ede9fe";
    const heading  = isReset ? "Password Reset Request" : "Verify Your Email";
    const subtext  = isReset
      ? "Use the one-time code below to reset your ShopEase password."
      : "Enter this code to verify your email address and activate your account.";

    const body = `
  <!-- Green status bar -->
  <tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;text-align:center;" class="mob-pad">
    <div style="display:inline-block;background:${iconBg};border-radius:50%;width:64px;height:64px;line-height:64px;font-size:30px;text-align:center;">${icon}</div>
    <h2 class="mob-hero" style="font-family:Inter,Arial,sans-serif;color:#fff;margin:14px 0 6px;font-size:22px;font-weight:800;">${heading}</h2>
    <p style="font-family:Inter,Arial,sans-serif;color:#c4b5fd;margin:0;font-size:13px;">${subtext}</p>
  </td></tr>

  <!-- OTP body -->
  <tr><td style="background:#ffffff;padding:32px 32px 28px;" class="mob-pad">
    <!-- OTP box -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
      <tr><td align="center">
        <table cellpadding="0" cellspacing="0" role="presentation">
          <tr><td style="background:linear-gradient(135deg,#1d4ed8,#4338ca);border-radius:16px;padding:24px 40px;text-align:center;">
            <p style="font-family:Inter,Arial,sans-serif;color:#bfdbfe;font-size:11px;text-transform:uppercase;letter-spacing:2.5px;margin:0 0 10px;font-weight:600;">Your OTP Code</p>
            <p style="font-family:'Courier New',Courier,monospace;color:#ffffff;font-size:40px;font-weight:900;letter-spacing:14px;margin:0;line-height:1;">${otp}</p>
            <p style="font-family:Inter,Arial,sans-serif;color:#93c5fd;font-size:12px;margin:10px 0 0;">Valid for <strong style="color:#fff;">10 minutes</strong></p>
          </td></tr>
        </table>
      </td></tr>
    </table>

    <!-- Warning -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;">
      <tr><td style="background:#fefce8;border:1px solid #fde047;border-radius:10px;padding:14px 18px;">
        <p style="font-family:Inter,Arial,sans-serif;margin:0;color:#854d0e;font-size:13px;line-height:1.6;">
          ⚠️ <strong>Never share this OTP</strong> with anyone. ShopEase will never ask for your OTP via call or email.
        </p>
      </td></tr>
    </table>

    <!-- Footer note -->
    <p style="font-family:Inter,Arial,sans-serif;color:#94a3b8;font-size:12px;text-align:center;margin:0;line-height:1.7;">
      Didn't request this? Simply ignore this email — your account remains safe.<br/>
      This code expires in 10 minutes.
    </p>
  </td></tr>`;

    await transporter.sendMail({ from: getSender(), to: userEmail, subject, html: wrap(body) });
    console.log(`[NodeMailer] OTP email sent → ${userEmail}`);
    return true;
  } catch (err) {
    console.error("[NodeMailer] sendOTPEmail error:", err.message);
    return false;
  }
};

// ── Order Confirmation Email ───────────────────────────────────────────────────
const sendOrderConfirmationEmail = async (userEmail, orderData) => {
  if (!transporter) { console.warn("[NodeMailer] SMTP not configured — skipping order email"); return false; }
  try {
    const {
      order_number      = "N/A",
      invoice_number    = "",
      total_amount      = 0,
      subtotal          = 0,
      shipping_charge   = 0,
      coupon_discount   = 0,
      tax               = 0,
      payment_method    = "online",
      payment_status    = "paid",
      estimated_delivery = "3–5 business days",
      customer_name     = "Valued Customer",
      customer_email    = userEmail,
      customer_phone    = "",
      delivery_address  = null,
      items             = [],
    } = orderData;

    const isCOD  = payment_method === "cod";
    const isPaid = payment_status === "paid" || payment_status === "success";
    const fmt    = (n) => `&#8377;${Number(n || 0).toLocaleString("en-IN")}`;
    const CLIENT = process.env.CLIENT_URL || "http://localhost:3000";

    // ── Item rows ──────────────────────────────────────────────────────────
    const itemRows = items.length > 0 ? items.map((item) => {
      const qty    = item.quantity || 1;
      const price  = Number(item.price || 0);
      const mrp    = Number(item.mrp || price);
      const total  = Number(item.total || price * qty);
      const saving = (mrp - price) * qty;
      const rawImg = item.product_image || "";
      const imgSrc = rawImg
        ? (rawImg.startsWith("http") ? rawImg : `${CLIENT}${rawImg}`)
        : null;
      const imgCell = imgSrc
        ? `<img src="${imgSrc}" alt="" width="56" height="56" class="mob-img" style="width:56px;height:56px;border-radius:8px;object-fit:cover;border:1px solid #e2e8f0;display:block;">`
        : `<div style="width:56px;height:56px;background:linear-gradient(135deg,#e0e7ff,#ede9fe);border-radius:8px;text-align:center;line-height:56px;font-size:24px;">🛒</div>`;

      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td width="64" style="vertical-align:top;padding-right:12px;">${imgCell}</td>
                <td style="vertical-align:top;">
                  <p style="font-family:Inter,Arial,sans-serif;margin:0 0 3px;color:#0f172a;font-size:13px;font-weight:700;line-height:1.4;">${item.product_name || "Product"}</p>
                  <p style="font-family:Inter,Arial,sans-serif;margin:0 0 3px;color:#64748b;font-size:12px;">Qty: <strong>${qty}</strong> × ${fmt(price)}</p>
                  ${saving > 0 ? `<p style="font-family:Inter,Arial,sans-serif;margin:0;color:#16a34a;font-size:11px;font-weight:600;">You saved ${fmt(saving)}</p>` : ""}
                </td>
                <td align="right" style="vertical-align:top;white-space:nowrap;padding-left:8px;">
                  <p style="font-family:Inter,Arial,sans-serif;margin:0;color:#1d4ed8;font-size:14px;font-weight:800;">${fmt(total)}</p>
                  ${mrp > price ? `<p style="font-family:Inter,Arial,sans-serif;margin:2px 0 0;color:#94a3b8;font-size:11px;text-decoration:line-through;">${fmt(mrp * qty)}</p>` : ""}
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    }).join("") : `<tr><td style="padding:16px 0;color:#94a3b8;font-size:13px;text-align:center;font-family:Inter,Arial,sans-serif;">No item details available.</td></tr>`;

    // ── Address block ──────────────────────────────────────────────────────
    const addrBlock = delivery_address ? `
      <tr><td style="padding-bottom:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
          <tr><td style="padding:16px 18px;">
            <p style="font-family:Inter,Arial,sans-serif;margin:0 0 8px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;">📦 Delivery Address</p>
            <p style="font-family:Inter,Arial,sans-serif;margin:0 0 4px;color:#0f172a;font-size:13px;font-weight:700;">${delivery_address.full_name || customer_name}</p>
            <p style="font-family:Inter,Arial,sans-serif;margin:0;color:#475569;font-size:12px;line-height:1.7;">
              ${delivery_address.address_line1 || ""}${delivery_address.address_line2 ? ", " + delivery_address.address_line2 : ""}<br/>
              ${delivery_address.city || ""}, ${delivery_address.state || ""} – ${delivery_address.pincode || ""}, ${delivery_address.country || "India"}
            </p>
            ${customer_phone ? `<p style="font-family:Inter,Arial,sans-serif;margin:6px 0 0;color:#64748b;font-size:12px;">📱 ${customer_phone}</p>` : ""}
          </td></tr>
        </table>
      </td></tr>` : "";

    // ── Email body ─────────────────────────────────────────────────────────
    const body = `
  <!-- ── Green confirmed banner ── -->
  <tr><td class="mob-hero" style="background:linear-gradient(135deg,#16a34a,#15803d);padding:28px 32px;text-align:center;">
    <div style="display:inline-block;background:rgba(255,255,255,0.18);border-radius:50%;width:60px;height:60px;line-height:60px;font-size:28px;text-align:center;">✅</div>
    <h2 style="font-family:Inter,Arial,sans-serif;color:#ffffff;margin:12px 0 4px;font-size:22px;font-weight:900;">Order Confirmed!</h2>
    <p style="font-family:Inter,Arial,sans-serif;color:#bbf7d0;margin:0;font-size:13px;">Thank you for shopping with ShopEase, <strong style="color:#fff;">${customer_name}</strong>!</p>
  </td></tr>

  <!-- ── White body ── -->
  <tr><td style="background:#ffffff;padding:28px 32px 24px;" class="mob-pad">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">

      <!-- Order # + Payment status — stacked on mobile -->
      <tr><td style="padding-bottom:20px;">
        <table class="mob-stack" width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td class="mob-full" style="vertical-align:top;padding-right:8px;width:50%;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="background:#eff6ff;border:2px solid #bfdbfe;border-radius:12px;">
                <tr><td style="padding:14px 16px;" class="mob-pad-sm">
                  <p style="font-family:Inter,Arial,sans-serif;margin:0 0 4px;font-size:10px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1.5px;">Order Number</p>
                  <p class="mob-order-num" style="font-family:Inter,Arial,sans-serif;margin:0;color:#1d4ed8;font-size:20px;font-weight:900;letter-spacing:0.5px;">#${order_number}</p>
                  ${invoice_number ? `<p style="font-family:Inter,Arial,sans-serif;margin:4px 0 0;color:#6b7280;font-size:11px;">Invoice: ${invoice_number}</p>` : ""}
                </td></tr>
              </table>
            </td>
            <td class="mob-full" style="vertical-align:top;padding-left:8px;padding-top:0;width:50%;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="background:${isPaid ? "#f0fdf4" : "#fffbeb"};border:2px solid ${isPaid ? "#86efac" : "#fde047"};border-radius:12px;">
                <tr><td style="padding:14px 16px;" class="mob-pad-sm">
                  <p style="font-family:Inter,Arial,sans-serif;margin:0 0 4px;font-size:10px;font-weight:700;color:${isPaid ? "#166534" : "#92400e"};text-transform:uppercase;letter-spacing:1.5px;">Payment</p>
                  <p style="font-family:Inter,Arial,sans-serif;margin:0;font-size:14px;font-weight:800;color:${isPaid ? "#15803d" : "#b45309"};">
                    ${isCOD ? "💵 Cash on Delivery" : isPaid ? "✅ Confirmed" : "⏳ Pending"}
                  </p>
                  <p style="font-family:Inter,Arial,sans-serif;margin:4px 0 0;font-size:11px;color:#6b7280;">${isCOD ? "Pay when delivered" : isPaid ? "Payment received" : "Awaiting payment"}</p>
                </td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Customer + Delivery info — stacked on mobile -->
      <tr><td style="padding-bottom:20px;">
        <table class="mob-stack" width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td class="mob-full" style="vertical-align:top;padding-right:8px;width:50%;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;height:100%;">
                <tr><td style="padding:14px 16px;" class="mob-pad-sm">
                  <p style="font-family:Inter,Arial,sans-serif;margin:0 0 8px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;">👤 Customer</p>
                  <p style="font-family:Inter,Arial,sans-serif;margin:0 0 3px;color:#0f172a;font-size:13px;font-weight:700;">${customer_name}</p>
                  <p class="mob-font-xs" style="font-family:Inter,Arial,sans-serif;margin:0 0 3px;color:#475569;font-size:12px;">📧 ${customer_email}</p>
                  ${customer_phone ? `<p class="mob-font-xs" style="font-family:Inter,Arial,sans-serif;margin:0;color:#475569;font-size:12px;">📱 ${customer_phone}</p>` : ""}
                </td></tr>
              </table>
            </td>
            <td class="mob-full" style="vertical-align:top;padding-left:8px;padding-top:0;width:50%;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;height:100%;">
                <tr><td style="padding:14px 16px;" class="mob-pad-sm">
                  <p style="font-family:Inter,Arial,sans-serif;margin:0 0 8px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;">🚚 Delivery</p>
                  <p style="font-family:Inter,Arial,sans-serif;margin:0 0 3px;color:#0f172a;font-size:13px;font-weight:700;">Standard Delivery</p>
                  <p style="font-family:Inter,Arial,sans-serif;margin:0 0 2px;color:#64748b;font-size:11px;">Expected by:</p>
                  <p style="font-family:Inter,Arial,sans-serif;margin:0;color:#1d4ed8;font-size:12px;font-weight:700;">${estimated_delivery}</p>
                </td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Delivery address -->
      ${addrBlock}

      <!-- Items heading -->
      <tr><td style="padding-bottom:10px;">
        <p style="font-family:Inter,Arial,sans-serif;margin:0;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;">🛒 Order Items</p>
      </td></tr>

      <!-- Items table -->
      <tr><td style="padding-bottom:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${itemRows}
        </table>
      </td></tr>

      <!-- Price summary -->
      <tr><td style="padding-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;">
          <tr><td style="padding:18px 20px;" class="mob-pad-sm">
            <p style="font-family:Inter,Arial,sans-serif;margin:0 0 14px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;">💰 Price Summary</p>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="font-family:Inter,Arial,sans-serif;color:#475569;font-size:13px;padding:4px 0;">Subtotal</td>
                <td align="right" style="font-family:Inter,Arial,sans-serif;color:#0f172a;font-size:13px;font-weight:600;padding:4px 0;">${fmt(subtotal)}</td>
              </tr>
              ${coupon_discount > 0 ? `
              <tr>
                <td style="font-family:Inter,Arial,sans-serif;color:#16a34a;font-size:13px;padding:4px 0;">Coupon Discount 🎫</td>
                <td align="right" style="font-family:Inter,Arial,sans-serif;color:#16a34a;font-size:13px;font-weight:600;padding:4px 0;">−${fmt(coupon_discount)}</td>
              </tr>` : ""}
              <tr>
                <td style="font-family:Inter,Arial,sans-serif;color:#475569;font-size:13px;padding:4px 0;">Shipping</td>
                <td align="right" style="font-family:Inter,Arial,sans-serif;font-size:13px;font-weight:600;padding:4px 0;color:${shipping_charge === 0 ? "#16a34a" : "#0f172a"};">${shipping_charge === 0 ? "FREE 🎉" : fmt(shipping_charge)}</td>
              </tr>
              ${tax > 0 ? `
              <tr>
                <td style="font-family:Inter,Arial,sans-serif;color:#475569;font-size:13px;padding:4px 0;">GST (5%)</td>
                <td align="right" style="font-family:Inter,Arial,sans-serif;color:#0f172a;font-size:13px;font-weight:600;padding:4px 0;">${fmt(tax)}</td>
              </tr>` : ""}
              <tr><td colspan="2" style="padding:10px 0 0;">
                <div style="border-top:2px dashed #e2e8f0;"></div>
              </td></tr>
              <tr>
                <td style="font-family:Inter,Arial,sans-serif;color:#0f172a;font-size:15px;font-weight:800;padding:10px 0 0;">Total Paid</td>
                <td class="mob-grand" align="right" style="font-family:Inter,Arial,sans-serif;font-size:20px;font-weight:900;color:#1d4ed8;padding:10px 0 0;">${fmt(total_amount)}</td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <!-- CTA button -->
      <tr><td class="mob-btn" align="center" style="padding-bottom:24px;">
        <a href="${CLIENT}/my-orders"
          style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#4338ca);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:50px;font-family:Inter,Arial,sans-serif;font-size:15px;font-weight:700;letter-spacing:0.3px;mso-padding-alt:14px 36px;">
          📦 Track Your Order
        </a>
      </td></tr>

      <!-- Trust badges -->
      <tr><td>
        <table class="mob-badge" width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
          <tr>
            <td class="mob-full" width="33%" align="center" style="padding:14px 8px;border-right:1px solid #e2e8f0;">
              <p class="mob-badge-icon" style="margin:0;font-size:22px;">🔒</p>
              <p class="mob-badge-txt" style="font-family:Inter,Arial,sans-serif;margin:5px 0 0;font-size:11px;font-weight:700;color:#475569;">Secure Payment</p>
            </td>
            <td class="mob-full" width="33%" align="center" style="padding:14px 8px;border-right:1px solid #e2e8f0;">
              <p class="mob-badge-icon" style="margin:0;font-size:22px;">🚚</p>
              <p class="mob-badge-txt" style="font-family:Inter,Arial,sans-serif;margin:5px 0 0;font-size:11px;font-weight:700;color:#475569;">Fast Delivery</p>
            </td>
            <td class="mob-full" width="33%" align="center" style="padding:14px 8px;">
              <p class="mob-badge-icon" style="margin:0;font-size:22px;">↩️</p>
              <p class="mob-badge-txt" style="font-family:Inter,Arial,sans-serif;margin:5px 0 0;font-size:11px;font-weight:700;color:#475569;">Easy Returns</p>
            </td>
          </tr>
        </table>
      </td></tr>

    </table>
  </td></tr>`;

    await transporter.sendMail({
      from:    getSender(),
      to:      userEmail,
      subject: `✅ Order Confirmed #${order_number} — Thank you, ${customer_name}!`,
      html:    wrap(body),
    });
    console.log(`[NodeMailer] order confirmation email sent → ${userEmail}`);
    return true;
  } catch (err) {
    console.error("[NodeMailer] sendOrderConfirmationEmail error:", err.message);
    return false;
  }
};

// ── Account Deletion Request Submitted (to customer) ─────────────────────────
const sendAccountDeletionRequestEmail = async (userEmail, data) => {
  if (!transporter) return false;
  try {
    const { customer_name = "Valued Customer", request_id = "", reason = "" } = data;
    const CLIENT = process.env.CLIENT_URL || "http://localhost:3000";

    const body = `
  <tr><td style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:28px 32px;text-align:center;" class="mob-pad">
    <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%;width:60px;height:60px;line-height:60px;font-size:28px;">📋</div>
    <h2 style="font-family:Inter,Arial,sans-serif;color:#fff;margin:12px 0 4px;font-size:20px;font-weight:900;">Deletion Request Received</h2>
    <p style="font-family:Inter,Arial,sans-serif;color:#fecaca;margin:0;font-size:13px;">We have received your account deletion request, ${customer_name}</p>
  </td></tr>
  <tr><td style="background:#ffffff;padding:28px 32px;" class="mob-pad">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">

      <tr><td style="padding-bottom:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;">
          <tr><td style="padding:16px 18px;">
            <p style="font-family:Inter,Arial,sans-serif;margin:0 0 6px;font-size:11px;font-weight:700;color:#c2410c;text-transform:uppercase;letter-spacing:1.5px;">⚠️ Important Notice</p>
            <p style="font-family:Inter,Arial,sans-serif;margin:0;font-size:13px;color:#7c2d12;line-height:1.6;">
              Your account deletion request is now under review. Your account remains <strong>active</strong> until the request is approved.
              If you change your mind, you can cancel the request from your account settings.
            </p>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding-bottom:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
          <tr><td style="padding:16px 18px;">
            <p style="font-family:Inter,Arial,sans-serif;margin:0 0 12px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;">Request Details</p>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#64748b;padding:4px 0;width:110px;">Request ID:</td>
                <td style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#0f172a;font-weight:600;padding:4px 0;">${request_id}</td>
              </tr>
              <tr>
                <td style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#64748b;padding:4px 0;">Reason:</td>
                <td style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#0f172a;font-weight:600;padding:4px 0;">${reason}</td>
              </tr>
              <tr>
                <td style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#64748b;padding:4px 0;">Status:</td>
                <td style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#d97706;font-weight:700;padding:4px 0;">Pending Review</td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding-bottom:20px;">
        <p style="font-family:Inter,Arial,sans-serif;margin:0 0 10px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;">What happens next?</p>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${["Our team will review your request within 2–3 business days",
             "We will verify there are no pending orders or dues on your account",
             "An admin will make the final decision and notify you by email",
             "Once approved, your account is deactivated and data deleted within 30 days"].map((step, i) => `
          <tr><td style="padding:6px 0;">
            <table cellpadding="0" cellspacing="0" role="presentation"><tr>
              <td style="width:24px;vertical-align:top;padding-right:10px;">
                <div style="width:20px;height:20px;background:#dbeafe;border-radius:50%;text-align:center;line-height:20px;font-family:Inter,Arial,sans-serif;font-size:11px;font-weight:700;color:#1d4ed8;">${i + 1}</div>
              </td>
              <td style="font-family:Inter,Arial,sans-serif;font-size:13px;color:#475569;line-height:1.5;">${step}</td>
            </tr></table>
          </td></tr>`).join("")}
        </table>
      </td></tr>

      <tr><td align="center" style="padding-bottom:20px;">
        <a href="${CLIENT}/my-settings"
          style="display:inline-block;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:50px;font-family:Inter,Arial,sans-serif;font-size:14px;font-weight:700;">
          Cancel My Request
        </a>
      </td></tr>

      <tr><td>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 18px;">
          <p style="font-family:Inter,Arial,sans-serif;margin:0;font-size:12px;color:#991b1b;line-height:1.6;">
            🔒 <strong>Not you?</strong> If you didn't submit this request, please contact us immediately at
            <a href="mailto:support@shopease.com" style="color:#dc2626;">support@shopease.com</a>
          </p>
        </div>
      </td></tr>

    </table>
  </td></tr>`;

    await transporter.sendMail({
      from:    getSender(),
      to:      userEmail,
      subject: `📋 Account Deletion Request Received — ShopEase`,
      html:    wrap(body),
    });
    console.log(`[NodeMailer] deletion request email sent → ${userEmail}`);
    return true;
  } catch (err) {
    console.error("[NodeMailer] sendAccountDeletionRequestEmail error:", err.message);
    return false;
  }
};

// ── Account Deletion Status Update (approved / rejected) ─────────────────────
const sendAccountDeletionStatusEmail = async (userEmail, data) => {
  if (!transporter) return false;
  try {
    const {
      customer_name = "Valued Customer",
      status        = "rejected",
      reason        = "",
      decided_by    = "ShopEase Team",
    } = data;

    const isApproved = status === "approved";
    const CLIENT = process.env.CLIENT_URL || "http://localhost:3000";

    const bannerBg   = isApproved ? "linear-gradient(135deg,#16a34a,#15803d)" : "linear-gradient(135deg,#2563eb,#1d4ed8)";
    const icon       = isApproved ? "✅" : "ℹ️";
    const heading    = isApproved ? "Deletion Request Approved" : "Deletion Request Rejected";
    const subtext    = isApproved
      ? `Your account has been deactivated, ${customer_name}. Data will be permanently deleted within 30 days.`
      : `Your account deletion request has been reviewed and rejected, ${customer_name}.`;

    const body = `
  <tr><td style="background:${bannerBg};padding:28px 32px;text-align:center;" class="mob-pad">
    <div style="display:inline-block;background:rgba(255,255,255,0.18);border-radius:50%;width:60px;height:60px;line-height:60px;font-size:28px;">${icon}</div>
    <h2 style="font-family:Inter,Arial,sans-serif;color:#fff;margin:12px 0 4px;font-size:20px;font-weight:900;">${heading}</h2>
    <p style="font-family:Inter,Arial,sans-serif;color:${isApproved ? "#bbf7d0" : "#bfdbfe"};margin:0;font-size:13px;">${subtext}</p>
  </td></tr>
  <tr><td style="background:#ffffff;padding:28px 32px;" class="mob-pad">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">

      <tr><td style="padding-bottom:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="background:${isApproved ? "#f0fdf4" : "#eff6ff"};border:1px solid ${isApproved ? "#86efac" : "#bfdbfe"};border-radius:12px;">
          <tr><td style="padding:16px 18px;">
            <p style="font-family:Inter,Arial,sans-serif;margin:0 0 6px;font-size:11px;font-weight:700;color:${isApproved ? "#166534" : "#1e40af"};text-transform:uppercase;letter-spacing:1.5px;">
              Decision Summary
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#64748b;padding:4px 0;width:110px;">Decision:</td>
                <td style="font-family:Inter,Arial,sans-serif;font-size:13px;font-weight:700;padding:4px 0;color:${isApproved ? "#16a34a" : "#1d4ed8"};">${isApproved ? "✅ Approved" : "❌ Rejected"}</td>
              </tr>
              <tr>
                <td style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#64748b;padding:4px 0;">Decided by:</td>
                <td style="font-family:Inter,Arial,sans-serif;font-size:12px;font-weight:600;padding:4px 0;color:#0f172a;">${decided_by}</td>
              </tr>
              ${reason ? `
              <tr>
                <td style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#64748b;padding:4px 0;vertical-align:top;">Notes:</td>
                <td style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#475569;padding:4px 0;line-height:1.5;">${reason}</td>
              </tr>` : ""}
            </table>
          </td></tr>
        </table>
      </td></tr>

      ${isApproved ? `
      <tr><td style="padding-bottom:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;">
          <tr><td style="padding:16px 18px;">
            <p style="font-family:Inter,Arial,sans-serif;margin:0 0 6px;font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:1.5px;">What happens now</p>
            <ul style="font-family:Inter,Arial,sans-serif;font-size:13px;color:#7c2d12;margin:0;padding:0 0 0 18px;line-height:2;">
              <li>Your account is now <strong>deactivated</strong> — you cannot log in</li>
              <li>All personal data will be permanently deleted within <strong>30 days</strong></li>
              <li>Any pending refunds will be processed to your original payment method</li>
              <li>You will receive a final confirmation email once deletion is complete</li>
            </ul>
          </td></tr>
        </table>
      </td></tr>` : `
      <tr><td style="padding-bottom:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;">
          <tr><td style="padding:16px 18px;">
            <p style="font-family:Inter,Arial,sans-serif;margin:0 0 6px;font-size:11px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:1.5px;">Your account is safe</p>
            <p style="font-family:Inter,Arial,sans-serif;margin:0;font-size:13px;color:#14532d;line-height:1.6;">
              Your account remains fully active. You can continue shopping on ShopEase.
              If you have concerns, please contact our support team and we'll be happy to help.
            </p>
          </td></tr>
        </table>
      </td></tr>
      <tr><td align="center" style="padding-bottom:20px;">
        <a href="${CLIENT}"
          style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#4338ca);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:50px;font-family:Inter,Arial,sans-serif;font-size:14px;font-weight:700;">
          Continue Shopping
        </a>
      </td></tr>`}

      <tr><td>
        <p style="font-family:Inter,Arial,sans-serif;margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.7;">
          Questions? Contact us at
          <a href="mailto:support@shopease.com" style="color:#6366f1;text-decoration:none;">support@shopease.com</a>
          or call <a href="tel:18001234567" style="color:#6366f1;text-decoration:none;">1800-123-4567</a>
        </p>
      </td></tr>

    </table>
  </td></tr>`;

    await transporter.sendMail({
      from:    getSender(),
      to:      userEmail,
      subject: isApproved
        ? `✅ Account Deletion Approved — ShopEase`
        : `ℹ️ Account Deletion Request Update — ShopEase`,
      html:    wrap(body),
    });
    console.log(`[NodeMailer] deletion status email (${status}) sent → ${userEmail}`);
    return true;
  } catch (err) {
    console.error("[NodeMailer] sendAccountDeletionStatusEmail error:", err.message);
    return false;
  }
};

// ── Generic Email ─────────────────────────────────────────────────────────────
const sendMail = async (to, subject, html) => {
  if (!transporter) return false;
  try {
    await transporter.sendMail({ from: getSender(), to, subject, html });
    return true;
  } catch (err) {
    console.error("[NodeMailer] sendMail error:", err.message);
    return false;
  }
};

module.exports = { sendOTPEmail, sendOrderConfirmationEmail, sendAccountDeletionRequestEmail, sendAccountDeletionStatusEmail, sendMail };
