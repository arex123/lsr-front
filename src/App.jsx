import "./App.css";
import Dashboard from "./pages/Dashboard";
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Header />
          <Dashboard />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
