import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import ApiService from "../services/ApiService";
import { FaTrashAlt } from "react-icons/fa";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await ApiService.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setDeletingId(userId);
      await ApiService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Navbar />
      <Header title="Users Management" description="View and manage all registered users" />

      <main className="flex-1 ml-64 pt-28 px-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh] text-gray-600">
            Loading users...
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700">All Users</h2>
            </div>

            {users.length === 0 ? (
              <p className="text-gray-500 text-center py-10">No users found.</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-sky-50 text-left text-gray-600 text-sm uppercase">
                    <th className="py-3 px-4 border-b">Name</th>
                    <th className="py-3 px-4 border-b">Email</th>
                    <th className="py-3 px-4 border-b">Role</th>
                    <th className="py-3 px-4 border-b">Joined</th>
                    <th className="py-3 px-4 border-b text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition cursor-pointer"
                    >
                      <td className="py-3 px-4 border-b">{user.name}</td>
                      <td className="py-3 px-4 border-b">{user.email}</td>
                      <td className="py-3 px-4 border-b capitalize">{user.role}</td>
                      <td className="py-3 px-4 border-b">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 border-b text-center">
                        <button
                          onClick={() => handleDelete(user._id)}
                          disabled={deletingId === user._id}
                          className={`p-2 rounded-md transition ${
                            deletingId === user._id
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600 text-white"
                          }`}
                        >
                          {deletingId === user._id ? "Deleting..." : <FaTrashAlt />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UsersPage;
