import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import { FaTrash, FaDownload } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

interface Subscriber {
  verified: boolean;
  _id: string;
  name: string;
  email: string;
  unsubscribedAt: Date | null;
}

const baseURL = import.meta.env.VITE_ADMIN_URL;

const Subscribers: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Fetch subscribers
  const fetchSubscribers = async () => {
    try {
      const res = await axios.get(`${baseURL}/subscribers`);
      setSubscribers(res.data);
    } catch (error) {
      toast.error("Failed to fetch subscribers");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Delete subscriber
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${baseURL}/subscribers/${id}`);
      setSubscribers(subscribers.filter((sub) => sub._id !== id));
      setConfirmDelete(null);
      toast.success("Subscriber deleted successfully");
    } catch (error) {
      toast.error("Failed to delete subscriber");
      console.error(error);
    }
  };

  // Download CSV
  const handleDownload = () => {
    const csvData = [
      ["Email", "Status"],
      ...subscribers.map((s) => {
        let status = "Pending";
        if (s.unsubscribedAt) status = "Unsubscribed";
        else if (s.verified) status = "Verified";
        return [s.email, status];
      }),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvData.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "subscribers.csv");
    document.body.appendChild(link);
    link.click();
    toast.success("CSV downloaded!");
  };

  const filteredSubscribers = subscribers.filter((sub) => {
    let status = sub.unsubscribedAt
      ? "Unsubscribed"
      : sub.verified
      ? "Verified"
      : "Pending";
    const searchTarget = `${sub.email} ${status}`.toLowerCase();
    return searchTarget.includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <Toaster position="top-right" />
      <Navbar />
      <div className="ml-64 pt-28 px-8 bg-gray-50 min-h-screen">
        <Header 
        title="Subscriptions" 
        description="Manage your subscribers" />

        <div className="mb-6 p-4 bg-gray-200 rounded-lg font-semibold text-gray-800">
          Total Subscribers: {subscribers.length}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <p className="font-semibold text-gray-700">
              {filteredSubscribers.length} Subscribers
            </p>
            <input
              type="text"
              placeholder="Search subscriber..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600">Email</th>
                  <th className="px-4 py-2 text-left text-gray-600">Status</th>
                  <th className="px-4 py-2 text-left text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubscribers.map((sub) => {
                  const status = sub.unsubscribedAt
                    ? "Unsubscribed"
                    : sub.verified
                    ? "Verified"
                    : "Pending";
                  const statusStyles =
                    status === "Verified"
                      ? "bg-green-100 text-green-800"
                      : status === "Unsubscribed"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-800";

                  return (
                    <tr key={sub._id}>
                      <td className="px-4 py-2">{sub.email}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${statusStyles}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => setConfirmDelete(sub._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleDownload}
            className="mt-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <FaDownload /> Download CSV
          </button>
        </div>

        {/* Confirm Delete Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/70 bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Are you sure you want to delete this subscriber?
              </h4>
              <div className="flex justify-center gap-6 mt-4">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Subscribers;
