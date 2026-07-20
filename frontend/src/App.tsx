import { Navigate, Route, Routes } from "react-router-dom";

import { LeadProvider } from "./contexts/LeadContext";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import DuplicateLeads from "./pages/DuplicateLeads";
import Settings from "./pages/Settings";
import UserManagement from "./pages/UserManagement";
import Login from "./pages/Login";
import LeadDetailsPage from "./pages/LeadDetailsPage";

function App() {

  return (

    <LeadProvider>

      <Routes>

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>

              <Dashboard />

            </ProtectedRoute>
          }
        />

        <Route
          path="/leads"
          element={
            <ProtectedRoute>

              <Leads />

            </ProtectedRoute>
          }
        />

        <Route
  path="/leads/:id"
  element={
    <ProtectedRoute>
      <LeadDetailsPage />
    </ProtectedRoute>
  }
/>

        <Route
          path="/duplicates"
          element={
            <ProtectedRoute>

              <DuplicateLeads />

            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>

              <Settings />

            </ProtectedRoute>
          }
        />

        <Route
  path="/settings/users"
  element={
    <ProtectedRoute>

      <UserManagement />

    </ProtectedRoute>
  }
/>

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </LeadProvider>

  );

}

export default App;