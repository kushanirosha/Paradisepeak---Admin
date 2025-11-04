import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import ApiService from "../services/ApiService";
import {
  FaBox,
  FaUsers,
  FaEnvelope,
  FaRegStar,
  FaPlus,
  FaImages,
  FaArrowRight,
} from "react-icons/fa6";

interface Booking {
  _id: string;
  name: string;
  packageName: string;
  status: string;
  createdAt: string;
}

interface Review {
  _id: string;
  userName: string;
  status: string;
  createdAt: string;
}

interface Package {
  _id: string;
  title: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Subscriber {
  _id: string;
  email: string;
}

interface DashboardStats {
  totalBookings: number;
  totalPackages: number;
  totalReviews: number;
  totalUsers: number;
  totalSubscribers: number;
  newBookings: Booking[];
  newReviews: Review[];
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    totalBookings: 0,
    totalPackages: 0,
    totalReviews: 0,
    totalUsers: 0,
    totalSubscribers: 0,
    newBookings: [],
    newReviews: [],
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [bookingsRes, packagesRes, reviewsRes, usersRes, subscribersRes] =
          await Promise.all([
            ApiService.getBookings(),
            ApiService.getPackages(),
            ApiService.getReviews(),
            ApiService.getUsers(),
            ApiService.getSubscribers(),
          ]);

        const extractArray = (res: any) => {
          if (Array.isArray(res)) return res;
          if (res?.data && Array.isArray(res.data)) return res.data;
          return [];
        };

        const bookings: Booking[] = extractArray(bookingsRes);
        const packagesData: Package[] = extractArray(packagesRes);
        const reviews: Review[] = extractArray(reviewsRes);
        const users: User[] = extractArray(usersRes);
        const subscribers: Subscriber[] = extractArray(subscribersRes);

        const totalBookings = bookings.length;
        const totalPackages = packagesData.length;
        const totalReviews = reviews.length;
        const totalUsers = users.length;
        const totalSubscribers = subscribers.length;

        const newBookings = bookings
          .filter((b) => b.status === "New")
          .slice(0, 5);

        const newReviews = reviews
          .filter((r) => r.status === "Pending")
          .slice(0, 5);

        setDashboardData({
          totalBookings,
          totalPackages,
          totalReviews,
          totalUsers,
          totalSubscribers,
          newBookings,
          newReviews,
        });
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Navbar />
      <Header
        title="Dashboard"
        description="Overview of system statistics and latest activity"
      />

      <main className="flex-1 ml-64 pt-28 px-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh] text-gray-600">
            Loading Dashboard...
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
              {[
                {
                  title: "Total Bookings",
                  value: dashboardData.totalBookings,
                  icon: <FaBox className="text-sky-500 text-2xl" />,
                },
                {
                  title: "Total Packages",
                  value: dashboardData.totalPackages,
                  icon: <FaBox className="text-violet-500 text-2xl" />,
                },
                {
                  title: "Total Reviews",
                  value: dashboardData.totalReviews,
                  icon: <FaRegStar className="text-green-500 text-2xl" />,
                },
                {
                  title: "Total Users",
                  value: dashboardData.totalUsers,
                  icon: <FaUsers className="text-pink-500 text-2xl" />,
                },
                {
                  title: "Total Subscribers",
                  value: dashboardData.totalSubscribers,
                  icon: <FaEnvelope className="text-amber-500 text-2xl" />,
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-shadow border border-gray-200 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {card.value}
                    </h2>
                  </div>
                  {card.icon}
                </div>
              ))}
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Recent Activities
                </h3>

                {/* New Bookings */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-600 mb-2">
                    New Bookings
                  </h4>
                  {dashboardData.newBookings.length === 0 ? (
                    <p className="text-gray-400 text-sm">No new bookings</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {dashboardData.newBookings.map((b) => (
                        <li
                          key={b._id}
                          onClick={() => navigate("/bookings")}
                          className="p-3 bg-gray-50 hover:bg-sky-50 cursor-pointer rounded-xl flex justify-between items-center transition"
                        >
                          <span>
                            {b.name} - {b.packageName}
                          </span>
                          <FaArrowRight className="text-sky-500" />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Pending Reviews */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-600 mb-2">
                    Pending Reviews
                  </h4>
                  {dashboardData.newReviews.length === 0 ? (
                    <p className="text-gray-400 text-sm">No pending reviews</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {dashboardData.newReviews.map((r) => (
                        <li
                          key={r._id}
                          onClick={() => navigate("/reviews")}
                          className="p-3 bg-gray-50 hover:bg-green-50 cursor-pointer rounded-xl flex justify-between items-center transition"
                        >
                          <span>{r.userName}</span>
                          <FaArrowRight className="text-green-500" />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Quick Actions
                </h3>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate("/packages")}
                    className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 hover:bg-sky-50 text-gray-700 transition-colors"
                  >
                    <FaPlus className="text-sky-500" /> Add New Package
                  </button>

                  <button
                    onClick={() => navigate("/gallery")}
                    className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 hover:bg-sky-50 text-gray-700 transition-colors"
                  >
                    <FaImages className="text-amber-500" /> Add Gallery Images
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
