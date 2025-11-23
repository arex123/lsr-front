import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. Please check your email for the correct link.");
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5050"}/api/auth/verify-email`,
        { token }
      );

      setStatus("success");
      setMessage(response.data.message);

      // Store the JWT token for auto-login
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setStatus("error");
      setMessage(error.response?.data?.message || "Verification failed. Please try again.");
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }

    setResendLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5050"}/api/auth/resend-verification`,
        { email }
      );
      
      setMessage(response.data.message);
      setStatus("success");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to resend verification email");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {status === "verifying" && (
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          )}
          {status === "success" && (
            <div className="text-6xl">✅</div>
          )}
          {status === "error" && (
            <div className="text-6xl">❌</div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800 dark:text-gray-100">
          {status === "verifying" && "Verifying Email..."}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Failed"}
        </h1>

        {/* Message */}
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>

        {/* Resend Section (only show on error) */}
        {status === "error" && (
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Resend Verification Email
            </h3>
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-gray-100"
              />
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? "Sending..." : "Resend Verification Email"}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center gap-4">
          {status === "success" && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting to dashboard...
            </div>
          )}
          {status === "error" && (
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

