import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { LeadProvider } from "./contexts/LeadContext";
import { SearchProvider } from "./contexts/SearchContext";

import ErrorBoundary from "./components/common/ErrorBoundary";

import { Toaster } from "react-hot-toast";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>

    <ErrorBoundary>

      <SearchProvider>

        <LeadProvider>

          <BrowserRouter>

            <App />

            <Toaster
              position="top-right"
              reverseOrder={false}
            />

          </BrowserRouter>

        </LeadProvider>

      </SearchProvider>

    </ErrorBoundary>

  </React.StrictMode>
);