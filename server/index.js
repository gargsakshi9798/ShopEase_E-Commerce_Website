const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// ─── Socket.IO Setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Make io accessible in controllers
app.set("io", io);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", limiter);

// ─── Razorpay Webhook ─────────────────────────────────────────────────────────
// MUST be mounted BEFORE express.json() so the raw request body is preserved
// for HMAC-SHA256 signature verification.
// Razorpay Dashboard → Settings → Webhooks → URL: /api/v1/webhook/razorpay
app.use(
  "/api/v1/webhook/razorpay",
  express.raw({ type: "application/json" }),
  require("./routes/api/v1/webhook/razorpay.webhook")
);

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(
  compression({
    level: 6,
    threshold: 10 * 1000,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    credentials: true,
  })
);
app.use(fileUpload());

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use("/public", express.static(path.join(__dirname, "/public/")));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to ShopEase - Enterprise E-Commerce API",
    version: "1.0.0",
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api", require("./routes/index"));

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Catches any error thrown by middleware or controllers that was not caught
// locally (e.g. synchronous throws, missing await, multer errors, etc.).
// Must be declared AFTER all routes and have exactly 4 arguments so Express
// recognises it as an error-handling middleware.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);

  // Mongoose validation error → 422
  if (err.name === "ValidationError") {
    const errors = Object.fromEntries(
      Object.entries(err.errors).map(([k, v]) => [k, v.message])
    );
    return res.status(422).json({ success: false, message: "Validation failed", errors });
  }

  // Mongoose duplicate key → 409
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: "Duplicate entry",
      errors: { [field]: `${field} already exists` },
    });
  }

  // JWT errors → 401
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  // Multer / file-upload size error → 413
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ success: false, message: "File too large" });
  }

  // Default → 500
  const status  = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === "production"
    ? "Internal server error"
    : (err.message || "Internal server error");

  return res.status(status).json({ success: false, message });
});

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
    server.listen(process.env.PORT, () => {
      console.log(
        `🚀 ShopEase Server running on http://127.0.0.1:${process.env.PORT}`
      );
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

module.exports = { app, io };
