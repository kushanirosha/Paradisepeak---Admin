import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import axios from "axios";
import ApiService from "../services/ApiService";
import toast, { Toaster } from "react-hot-toast";
import LoadingOverlay from "../components/LoadingOverlay";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/home", { replace: true });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await ApiService.loginUser(values);
      if (userData.token) {
        localStorage.setItem("token", userData.token);
        localStorage.setItem("role", userData.role);
        localStorage.setItem("userid", userData.userid);
        toast.success("Login successful! Redirecting...");
        setTimeout(() => navigate("/home"), 2000);
      } else {
        toast.error(userData.message || "Invalid credentials");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Login failed");
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
    <> <Toaster position="top-right" reverseOrder={false} />
      {loading && <LoadingOverlay />}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-100 to-cyan-200 px-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-sky-700">Welcome Back!</h1>
            <p className="text-gray-600 mt-1">
              Sign in to explore travel adventures
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white/70">
              <FaEnvelope className="text-sky-600 mr-3" />
              <input
                type="email"
                name="email"
                placeholder="Email"
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

            <div className="flex justify-between text-sm text-sky-700 font-medium">
              <a href="/SignUp" className="hover:underline">
                Create Account
              </a>
              <a href="/forgot" className="hover:underline">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 transition-colors text-white font-semibold py-2 rounded-lg shadow-md"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
