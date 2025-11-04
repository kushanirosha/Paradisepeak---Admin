/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Image,
  FileStack,
  Calendar,
  Star,
  Users,
  LogOut,
} from "lucide-react";
import ApiService from "../services/ApiService";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuth = ApiService.isAuthenticated();
  const isAdmin = ApiService.isAdmin();
  // const isUser = ApiService.isUser();

  // Dummy user for testing
  const user = {
    name: "Admin User",
    role: "Admin",
  };

  const navItems = [
    ...(isAdmin && isAuth
      ? [
          { label: "Home", path: "/home", icon: <LayoutDashboard size={20} /> },
          { label: "Gallery", path: "/gallery", icon: <Image size={20} /> },
          { label: "Packages", path: "/packages", icon: <FileStack size={20} /> },
          { label: "Bookings", path: "/bookings", icon: <Calendar size={20} /> },
          { label: "Reviews", path: "/reviews", icon: <Star size={20} /> },
          { label: "Subscribers", path: "/subscribers", icon: <Users size={20} /> },
          { label: "Share Photos", path: "/sharephotos", icon: <Image size={20} /> },
          { label: "Users", path: "/users", icon: <Users size={20} /> },
        ]
      : []),
  ];

  const logout = () => {
    ApiService.logout();
    navigate("/");
  };

  const userInitial = user.name.charAt(0).toUpperCase();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-sky-900 to-blue-950 text-white flex flex-col justify-between shadow-lg">
      {/* Top Section */}
      <div className="px-6 py-6 border-b border-sky-700">
        <h1 className="text-2xl font-bold tracking-wide text-sky-300">
          Paradisepeak Travels
        </h1>
        <p className="text-sm text-sky-400 italic mt-1">Travel into Adventure</p>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto mt-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path; // highlights active tab

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                isActive
                  ? "bg-sky-700 text-white shadow-md"
                  : "text-gray-200 hover:bg-sky-800 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="border-t border-sky-700 px-5 py-4 flex items-center justify-between">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center font-semibold text-lg">
            {userInitial}
          </div>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-sky-400">{user.role}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 rounded-md hover:bg-red-600 transition-colors duration-200"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
