import "./App.css";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./store/AuthContext";
import Header from "./components/Header";

/**
 * Main App Component
 */
function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Dashboard />
      </div>
    </AuthProvider>
  );
}

export default App;
