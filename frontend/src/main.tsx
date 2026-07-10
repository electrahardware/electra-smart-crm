import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { LeadProvider } from "./contexts/LeadContext";
import "./index.css";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { Toaster } from "react-hot-toast";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>

  <BrowserRouter>

  <App />

  <Toaster
    position="top-right"
    reverseOrder={false}
  />

</BrowserRouter>

</ErrorBoundary>
  </React.StrictMode>
);