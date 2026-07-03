import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { LeadProvider } from "./contexts/LeadContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LeadProvider>
  <App />
</LeadProvider>
    </BrowserRouter>
  </React.StrictMode>
);