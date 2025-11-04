import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import ApiService from "../services/ApiService";
import LoadingOverlay from "../components/LoadingOverlay";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    email: "",
  });

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await ApiService.forgotPassword(values);
      toast.success(userData.message || "Verification email sent!");
      setTimeout(() => navigate("/"), 2500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Request failed");
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setTimeout(() => setLoading(false), 4000);
    }
  };

  return (
    <> <Toaster position="top-right" />
      {loading && <LoadingOverlay />}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-100 to-cyan-200 px-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-sky-700 mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-600 text-sm">
              Please enter the email address linked with your account.
            </p>
          </div>

          <form onSubmit={handleForgot} className="space-y-5">
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white/70">
              <FaEnvelope className="text-sky-600 mr-3" />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                onChange={(e) =>
                  setValues({ ...values, email: e.target.value })
                }
                required
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 transition-colors text-white font-semibold py-2 rounded-lg shadow-md"
            >
              Verify
            </button>

            <div className="text-center text-sm text-sky-700 mt-3">
              <a href="/" className="hover:underline">
                Back to Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
