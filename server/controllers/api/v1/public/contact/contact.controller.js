const Base           = require("../../../../../helper/exception_handling/index.js");
const { HTTPS }      = require("../../../../../helper/https-status-codes/https-status-codes");
const ContactMessage = require("../../../../../models/ContactMessage");

// Simple email regex — avoids heavy dependencies
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone: optional, allow digits / spaces / + / - / ( )
const PHONE_RE = /^[\d\s+\-().]{7,20}$/;

class ContactController {
  /**
   * POST /public/contact
   * Public — no auth required.
   * Validates every field, stores the message, returns the created doc id.
   */
  async submitContact(req, res) {
    try {
      const { name, email, phone, subject, message, department } = req.body;

      // ── Field-level validation ──────────────────────────────────────────────
      const errors = {};

      // name
      if (!name?.trim()) {
        errors.name = "Name is required";
      } else if (name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters";
      } else if (name.trim().length > 100) {
        errors.name = "Name must be 100 characters or fewer";
      }

      // email
      if (!email?.trim()) {
        errors.email = "Email is required";
      } else if (!EMAIL_RE.test(email.trim())) {
        errors.email = "Enter a valid email address";
      }

      // phone — optional but validated when provided
      if (phone?.trim() && !PHONE_RE.test(phone.trim())) {
        errors.phone = "Enter a valid phone number";
      }

      // subject / department — derive subject from department if subject blank
      const resolvedSubject = subject?.trim() || department?.trim() || "";
      if (!resolvedSubject) {
        errors.subject = "Subject is required";
      } else if (resolvedSubject.length > 200) {
        errors.subject = "Subject must be 200 characters or fewer";
      }

      // message
      if (!message?.trim()) {
        errors.message = "Message is required";
      } else if (message.trim().length < 10) {
        errors.message = "Message must be at least 10 characters";
      } else if (message.trim().length > 2000) {
        errors.message = "Message must be 2000 characters or fewer";
      }

      if (Object.keys(errors).length > 0) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, errors);
      }

      // ── Persist ────────────────────────────────────────────────────────────
      const msg = new ContactMessage({
        name:       name.trim(),
        email:      email.trim().toLowerCase(),
        phone:      phone?.trim() || "",
        subject:    resolvedSubject,
        message:    message.trim(),
        status:     "unread",
        ip_address: req.ip || req.headers["x-forwarded-for"] || null,
        source:     "contact_form",
      });

      await msg.save();

      return Base.sendResponse(
        res,
        HTTPS.CREATED,
        { id: msg._id },
        "Message sent successfully. We'll get back to you shortly."
      );
    } catch (error) {
      console.error("submitContact error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new ContactController();
