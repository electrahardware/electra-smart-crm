import express from "express";
import cors from "cors";

import leadRoutes from "./routes/lead.routes";
import importRoutes from "./routes/import.routes";
import callRoutes from "./routes/call.routes";
import attachmentRoutes from "./routes/attachment.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/leads", leadRoutes);
app.use("/api/import", importRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/attachments", attachmentRoutes);

app.get("/", (req, res) => {
  res.send("Electra Smart CRM Backend");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server Running : http://localhost:${PORT}`);
});