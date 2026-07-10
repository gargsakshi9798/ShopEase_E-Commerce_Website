const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { HTTPS } = require("../https-status-codes/https-status-codes");
const Base = require("../exception_handling/index.js");
const cloudinary = require("../../config/cloudinary");

// ─── File Upload (Local) ──────────────────────────────────────────────────────
const FileUpload = async (mediaFile, folder) => {
  try {
    const file = mediaFile;
    const fileName = Date.now() + "-" + file.name.replace(/\s+/g, "_");

    const dir = path.join(__dirname, "../../", "public", folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const uploadPath = path.join(dir, fileName);

    await new Promise((resolve, reject) => {
      file.mv(uploadPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return `/public${folder}/` + fileName;
  } catch (error) {
    console.error("FileUpload error:", error);
    throw error;
  }
};

// ─── Cloudinary Upload ────────────────────────────────────────────────────────
const CloudinaryUpload = async (filePath, folder = "shopease") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `shopease/${folder}`,
      resource_type: "auto",
    });
    return result.secure_url;
  } catch (error) {
    console.error("CloudinaryUpload error:", error);
    throw error;
  }
};

// ─── Check Exists ─────────────────────────────────────────────────────────────
const CheckExists = async (Model, condition = {}) => {
  try {
    const cleanCondition = Object.entries(condition).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (Object.keys(cleanCondition).length === 0) return null;

    return await Model.findOne(cleanCondition);
  } catch (error) {
    console.error("CheckExists error:", error);
    throw error;
  }
};

// ─── Create New ───────────────────────────────────────────────────────────────
const CreateNew = async (Model, data) => {
  try {
    const doc = new Model(data);
    return await doc.save();
  } catch (error) {
    console.error("CreateNew error:", error);
    throw error;
  }
};

// ─── Update Data ──────────────────────────────────────────────────────────────
const UpdateData = async (Model, updateData, condition) => {
  try {
    return await Model.findOneAndUpdate(condition, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    console.error("UpdateData error:", error);
    throw error;
  }
};

// ─── Delete Data ──────────────────────────────────────────────────────────────
const DeleteData = async (Model, condition) => {
  try {
    return await Model.findOneAndDelete(condition);
  } catch (error) {
    console.error("DeleteData error:", error);
    throw error;
  }
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Paginate = async (Model, queryOptions, req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.per_page) || 10;
    const skip = (page - 1) * per_page;

    const { filter = {}, sort = { createdAt: -1 }, populate = [], select = "" } = queryOptions;

    let query = Model.find(filter).sort(sort).skip(skip).limit(per_page);

    if (select) query = query.select(select);
    if (populate.length > 0) {
      populate.forEach((p) => (query = query.populate(p)));
    }

    const [data, total] = await Promise.all([query, Model.countDocuments(filter)]);
    const total_pages = Math.ceil(total / per_page);

    return Base.sendResponse(res, HTTPS.OK, {
      data,
      current_page: page,
      total_pages,
      per_page,
      total,
    });
  } catch (error) {
    console.error("Paginate error:", error);
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// ─── Generate OTP ─────────────────────────────────────────────────────────────
const GenerateOTP = (length = 6) => {
  return Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  ).toString();
};

// ─── Generate Random Code ─────────────────────────────────────────────────────
const GenerateCode = (length = 8) => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length)
    .toUpperCase();
};

// ─── Generate Invoice Number ──────────────────────────────────────────────────
const GenerateInvoiceNumber = () => {
  const prefix = "SE-INV";
  const timestamp = Date.now();
  const suffix = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${suffix}`;
};

// ─── Generate Order Number ────────────────────────────────────────────────────
const GenerateOrderNumber = () => {
  const prefix = "SE-ORD";
  const timestamp = Date.now();
  const suffix = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${suffix}`;
};

// ─── Format Date ──────────────────────────────────────────────────────────────
const FormatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ─── Calculate Discount ───────────────────────────────────────────────────────
const CalculateDiscount = (originalPrice, discountPercent) => {
  const discount = (originalPrice * discountPercent) / 100;
  return Math.round(originalPrice - discount);
};

// ─── Check if Valid ObjectId ──────────────────────────────────────────────────
const IsValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// ─── Download Sample File ─────────────────────────────────────────────────────
const DownloadSample = async (req, res, name) => {
  try {
    const filePath = path.join(__dirname, `../../public/sample/${name}.xlsx`);
    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename=${name}.xlsx`);
      const fileStream = fs.createReadStream(filePath);
      return fileStream.pipe(res);
    } else {
      return res.status(404).json({ success: false, message: "Sample file not found" });
    }
  } catch (error) {
    console.error("DownloadSample error:", error);
  }
};

module.exports = {
  FileUpload,
  CloudinaryUpload,
  CheckExists,
  CreateNew,
  UpdateData,
  DeleteData,
  Paginate,
  GenerateOTP,
  GenerateCode,
  GenerateInvoiceNumber,
  GenerateOrderNumber,
  FormatDate,
  CalculateDiscount,
  IsValidObjectId,
  DownloadSample,
};
