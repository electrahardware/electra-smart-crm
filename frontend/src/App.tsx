import { Navigate, Route, Routes } from "react-router-dom";

import { LeadProvider } from "./contexts/LeadContext";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import AnalyticsPage from "./pages/AnalyticsPage";
import AiDailyLeads from "./pages/AiDailyLeads";
import AiDailyLeadConfiguration from "./pages/AiDailyLeadConfiguration";
import AuditLogs from "./pages/AuditLogs";
import BackupSettingsPage from "./pages/BackupSettingsPage";
import Dashboard from "./pages/Dashboard";
import DuplicateLeads from "./pages/DuplicateLeads";
import Followups from "./pages/Followups";
import LeadDetailsPage from "./pages/LeadDetailsPage";
import Leads from "./pages/Leads";
import Login from "./pages/Login";
import MyProfile from "./pages/MyProfile";
import Settings from "./pages/Settings";
import UserManagement from "./pages/UserManagement";

function App() {
  return (
    <LeadProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<Login />} />

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
          path="/ai-daily-leads"
          element={
            <ProtectedRoute>
              <AiDailyLeads />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-daily-leads/configuration"
          element={
            <ProtectedRoute>
              <AiDailyLeadConfiguration />
            </ProtectedRoute>
          }
        />

        <Route
          path="/followups"
          element={
            <ProtectedRoute>
              <Followups />
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
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute>
              <AuditLogs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MyProfile />
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
          path="/settings/backup"
          element={
            <ProtectedRoute>
              <BackupSettingsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </LeadProvider>
  );
}

export default App;
