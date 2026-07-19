const path           = require("path");
const fs             = require("fs");
const Base           = require("../../../../../helper/exception_handling/index.js");
const { HTTPS }      = require("../../../../../helper/https-status-codes/https-status-codes");
const ContactMessage = require("../../../../../models/ContactMessage");

// ── Validation helpers ────────────────────────────────────────────────────────
const EMAIL_RE     = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE     = /^[\d\s+\-().]{7,20}$/;
const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES    = 5 * 1024 * 1024; // 5 MB

/**
 * Save a single express-fileupload file to /public/contact_images/
 * Returns the public URL path (served by express.static).
 */
const saveLocally = async (file) => {
  const ext      = path.extname(file.name).toLowerCase() || ".jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const dir      = path.join(__dirname, "../../../../../public/contact_images");

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await file.mv(path.join(dir, fileName));
  return `/public/contact_images/${fileName}`;
};

/**
 * Normalise express-fileupload's req.files["images"]:
 *   single file  → object  →  wrap in array
 *   multiple     → already array
 */
const toArray = (raw) => {
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
};

class ContactController {
  /**
   * POST /public/contact
   * Accepts multipart/form-data (express-fileupload parses it globally).
   * Images field: "images" — min 1, max 2, each ≤ 5 MB, JPEG/PNG/WebP only.
   */
  async submitContact(req, res) {
    try {
      const {
        name, email, phone, subject, message,
        department, reference_id, reference_type, reference_label,
      } = req.body;

      // Normalise uploaded files (cap at 2)
      const files = toArray(req.files?.images).slice(0, 2);

      // ── Validation ─────────────────────────────────────────────────────────
      const errors = {};

      if (!name?.trim())                                errors.name    = "Name is required";
      else if (name.trim().length < 2)                  errors.name    = "Name must be at least 2 characters";
      else if (name.trim().length > 100)                errors.name    = "Name must be 100 characters or fewer";

      if (!email?.trim())                               errors.email   = "Email is required";
      else if (!EMAIL_RE.test(email.trim()))            errors.email   = "Enter a valid email address";

      if (phone?.trim() && !PHONE_RE.test(phone.trim())) errors.phone = "Enter a valid phone number";

      const resolvedSubject = subject?.trim() || department?.trim() || "";
      if (!resolvedSubject)                             errors.subject = "Subject is required";
      else if (resolvedSubject.length > 200)            errors.subject = "Subject must be 200 characters or fewer";

      if (!message?.trim())                             errors.message = "Message is required";
      else if (message.trim().length < 10)              errors.message = "Message must be at least 10 characters";
      else if (message.trim().length > 2000)            errors.message = "Message must be 2000 characters or fewer";

      if (files.length < 1) {
        errors.images = "At least 1 image is required";
      } else {
        const badMime = files.find((f) => !ALLOWED_MIME.includes(f.mimetype));
        if (badMime) errors.images = "Only JPEG, PNG, and WebP images are allowed";

        const tooBig = files.find((f) => f.size > MAX_BYTES);
        if (tooBig)  errors.images = "Each image must be 5 MB or smaller";
      }

      if (Object.keys(errors).length > 0) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, errors);
      }

      // ── Save images locally ────────────────────────────────────────────────
      let imageUrls = [];
      try {
        imageUrls = await Promise.all(files.map(saveLocally));
      } catch (saveErr) {
        console.error("Image save error:", saveErr);
        return Base.sendError(
          res,
          HTTPS.INTERNAL_SERVER_ERROR,
          { images: "Image save failed. Please try again." }
        );
      }

      // ── Persist ────────────────────────────────────────────────────────────
      const VALID_REF_TYPES = ["order", "product", "payment", "review", "none"];
      const safeRefType  = VALID_REF_TYPES.includes(reference_type) ? reference_type : "none";
      const safeRefId    = safeRefType !== "none" && reference_id ? reference_id : null;
      const safeRefLabel = typeof reference_label === "string" ? reference_label.slice(0, 200) : "";

      const msg = new ContactMessage({
        name:            name.trim(),
        email:           email.trim().toLowerCase(),
        phone:           phone?.trim() || "",
        subject:         resolvedSubject,
        message:         message.trim(),
        department:      department?.trim() || "",
        reference_type:  safeRefType,
        reference_id:    safeRefId,
        reference_label: safeRefLabel,
        images:          imageUrls,
        status:          "unread",
        ip_address:      req.ip || req.headers["x-forwarded-for"] || null,
        source:          "contact_form",
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
