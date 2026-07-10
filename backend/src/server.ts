import dotenv from "dotenv";

dotenv.config();
import express from "express";
import cors from "cors";

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

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/api/leads", leadRoutes);
app.use("/api/import", importRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/timeline", timelineRoutes);
app.use(
  "/api/duplicates",
  duplicateRoutes
);
app.use(
  "/api/merge",
  mergeRoutes
);
app.use(
  "/api/activity",
  activityRoutes
);
app.use("/api/dashboard", dashboardRoutes);
app.use(
  "/api/quotations",
  quotationRoutes
);
app.use(
  "/api/users",
  userRoutes
);

app.get("/", (req, res) => {
  res.send(
    "Electra Smart CRM Backend"
  );
});

const PORT =
  Number(
    process.env.PORT
  ) || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server Running : http://localhost:${PORT}`
  );
});