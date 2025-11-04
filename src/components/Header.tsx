import React from "react";
import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  description: string;
}

const Header: React.FC<HeaderProps> = ({ title, description }) => {
  return (
    <header className="fixed top-0 left-64 right-0 bg-white border-b border-gray-200 shadow-sm z-30">
      <div className="flex justify-between items-center px-8 py-4">
        {/* Page Info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500">{description}</p>
        </div>

        {/* Search + Notifications */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-100 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:outline-none w-64 text-sm"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-500"
              size={16}
            />
          </div>

          <button className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <Bell className="text-gray-700" size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
