import dotenv from "dotenv";

dotenv.config();

import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import * as Sentry from "@sentry/node";

import activityRoutes from "./routes/activity.routes";
import analyticsRoutes from "./routes/analytics";
import attachmentRoutes from "./routes/attachment.routes";
import auditRoutes from "./routes/audit.routes";
import backupRoutes from "./routes/backup.routes";
import callRoutes from "./routes/call.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import duplicateRoutes from "./routes/duplicate.routes";
import importRoutes from "./routes/import.routes";
import leadRoutes from "./routes/lead.routes";
import masterSearchRoutes from "./routes/masterSearch";
import mergeRoutes from "./routes/merge.routes";
import notesRoutes from "./routes/notes";
import quotationRoutes from "./routes/quotation.routes";
import timelineRoutes from "./routes/timeline.routes";
import userRoutes from "./routes/user.routes";
import aiDailyLeadRoutes from "./routes/aiDailyLead.routes";
import { startAiDailyLeadScheduler } from "./services/aiDailyLead.service";

const app = express();

app.set("trust proxy", 1);

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, sendDefaultPii: false });
}

const productionOrigins = [
  "https://crm.electrahardware.com",
  "https://electra-smart-crm.vercel.app",
];

const allowedOrigins = process.env.NODE_ENV === "production"
  ? productionOrigins
  : [...productionOrigins, "http://localhost:5173", "http://127.0.0.1:5173"];

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      baseUri: ["'none'"],
      frameAncestors: ["'none'"],
      formAction: ["'none'"],
    },
  },
  hsts: process.env.NODE_ENV === "production" ? undefined : false,
}));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin is not allowed by CORS."));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
  maxAge: 86_400,
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1_000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again shortly." },
});

app.use(
  express.json({
    limit: "50mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  }),
);

app.get("/", (_req, res) => {
  res.json({
    status: "OK",
    service: "Electra Smart CRM API",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ================= API Routes =================

app.use((req, _res, next) => {
  console.log(req.method, req.path);

  next();
});

app.use("/api", apiLimiter);

app.use("/api/leads", leadRoutes);
app.use("/api/import", importRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/backups", backupRoutes);
app.use("/api/duplicates", duplicateRoutes);
app.use("/api/merge", mergeRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/master-search", masterSearchRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/ai-daily-leads", aiDailyLeadRoutes);

// ==============================================

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof Error) {
    console.error("API error:", error.message);
    if (process.env.SENTRY_DSN) Sentry.captureException(error);

    if (error.message === "Origin is not allowed by CORS.") {
      return res.status(403).json({ message: "Origin is not allowed." });
    }

    if (error.message.includes("Only JPG") || error.message.includes("File too large")) {
      return res.status(400).json({ message: error.message });
    }
  }

  return res.status(500).json({ message: "Internal server error." });
});

const PORT = Number(process.env.PORT) || 5000;

startAiDailyLeadScheduler();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
