import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";

import { LeadProvider } from "./contexts/LeadContext";

function App() {
  return (
    <LeadProvider>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/leads"
          element={<Leads />}
        />
      </Routes>
    </LeadProvider>
  );
}

export default App;