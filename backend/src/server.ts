import dotenv from "dotenv";

dotenv.config();

console.log("SERVER JWT =", process.env.JWT_SECRET);

import express from "express";
import cors from "cors";
import path from "path";

import leadRoutes from "./routes/lead.routes";
import importRoutes from "./routes/import.routes";
import callRoutes from "./routes/call.routes";
import attachmentRoutes from "./routes/attachment.routes";
import timelineRoutes from "./routes/timeline.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import quotationRoutes from "./routes/quotation.routes";
import userRoutes from "./routes/user.routes";
import duplicateRoutes from "./routes/duplicate.routes";
import mergeRoutes from "./routes/merge.routes";
import activityRoutes from "./routes/activity.routes";
import analyticsRoutes from "./routes/analytics";
import masterSearchRoutes from "./routes/masterSearch";
import notesRoutes from "./routes/notes";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
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

app.use("/api/leads", leadRoutes);
app.use("/api/import", importRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/duplicates", duplicateRoutes);
app.use("/api/merge", mergeRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/master-search", masterSearchRoutes);
app.use("/api/notes", notesRoutes);

// ==============================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});