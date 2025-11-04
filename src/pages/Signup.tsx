import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import ApiService from "../services/ApiService";
import LoadingOverlay from "../components/LoadingOverlay";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await ApiService.register(values);
      toast.success(userData.message || "Registration successful!");
      setTimeout(() => navigate("/"), 2500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Registration failed");
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

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-200 px-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-sky-700">Create Account</h1>
            <p className="text-gray-600 mt-1">
              Join us to explore the underwater world!
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white/70">
              <FaUser className="text-sky-600 mr-3" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                onChange={(e) =>
                  setValues({ ...values, name: e.target.value })
                }
                required
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
            </div>

            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white/70">
              <FaEnvelope className="text-sky-600 mr-3" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                onChange={(e) =>
                  setValues({ ...values, email: e.target.value })
                }
                required
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
            </div>

            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white/70">
              <FaLock className="text-sky-600 mr-3" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={(e) =>
                  setValues({ ...values, password: e.target.value })
                }
                required
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
            </div>

            <div className="flex justify-center text-sm text-gray-600 font-medium">
              <span>Already have an account? </span>
              <a href="/" className="hover:underline text-sky-700">
                 Login
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 transition-colors text-white font-semibold py-2 rounded-lg shadow-md"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </>

  );
};

export default Signup;
