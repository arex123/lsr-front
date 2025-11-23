import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ProfilePage from "./pages/ProfilePage";
import PatternExplorer from "./pages/PatternExplorer";
import PatternDetail from "./pages/PatternDetail";
import BulkProblemEntry from "./pages/BulkProblemEntry";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import { AuthProvider } from "./store/AuthContext";
import { ThemeProvider } from "./store/ThemeContext";
import Header from "./components/Header";

/**
 * Main App Component
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Routes>
              {/* Email Verification Page (no header) */}
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* Password Reset Page (no header) */}
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Main Dashboard (with header) */}
              <Route
                path="/*"
                element={
                  <>
                    <Header />
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/analytics" element={<AnalyticsDashboard />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/patterns" element={<PatternExplorer />} />
                      <Route path="/patterns/:id" element={<PatternDetail />} />
                      <Route path="/bulk-add" element={<BulkProblemEntry />} />
                    </Routes>
                  </>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
