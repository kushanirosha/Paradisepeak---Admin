import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import { CheckCircle, Ban, Clock } from "lucide-react";
import ApiService from "../services/ApiService";
import toast, { Toaster } from "react-hot-toast";

export type Status = "Approved" | "Hide" | "Pending";

export interface Review {
  _id: string;
  name?: string;
  userName?: string;
  email: string;
  score?: number;
  rating?: number;
  review: string;
  createdAt?: string;
  status: Status;
}

const statusIcons: Record<Status, React.ReactNode> = {
  Approved: <CheckCircle size={20} className="text-green-500" />,
  Hide: <Ban size={20} className="text-red-500" />,
  Pending: <Clock size={20} className="text-orange-500" />,
};

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [selected, setSelected] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getReviews();
      const mapped = data.map((r: Review) => ({
        ...r,
        userName: r.userName || r.name || "Anonymous",
        status: r.status || "Pending",
      }));
      setReviews(mapped);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filtered = filter === "ALL" ? reviews : reviews.filter((r) => r.status.toUpperCase() === filter.toUpperCase());

  const handleUpdate = async (review: Review) => {
    try {
      await ApiService.updateReview(review._id, { status: review.status });
      setReviews((prev) => prev.map((r) => (r._id === review._id ? review : r)));
      setSelected(null);
      toast.success("Review updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update review");
    }
  };

  const handleDelete = async (review: Review) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await ApiService.deleteReview(review._id);
      await fetchReviews();
      setSelected(null);
      toast.success("Review deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete review");
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <Navbar />
      <div className="flex min-h-screen bg-gray-100">
        <div className="flex-1 ml-64 pt-28 px-8">
          <Header 
          title="Review Moderation" 
          description="Organize and respond to guest feedback" />

          <div className="mb-6 flex items-center gap-4">
            <label className="font-medium text-gray-700">Filter by Status:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">ALL</option>
              <option value="Approved">Approved</option>
              <option value="Hide">Hide</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {loading && <p>Loading reviews...</p>}
          {!loading && filtered.length === 0 && <p className="text-gray-500">No reviews found.</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <div key={item._id} className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {statusIcons[item.status]}
                    <h2 className="font-semibold text-lg">{item.userName}</h2>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">
                    <span className="font-semibold">Email:</span> {item.email}
                  </p>
                  <p className="text-gray-500 text-sm mb-1">
                    <span className="font-semibold">Rating:</span> {"⭐".repeat(item.rating || 0)}
                  </p>
                  <p className="text-gray-500 text-sm mb-2">
                    <span className="font-semibold">Date:</span>{" "}
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                  </p>
                  <p className="text-gray-700 text-sm line-clamp-3">{item.review}</p>
                </div>
                <button
                  className="mt-3 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                  onClick={() => setSelected(item)}
                >
                  Respond
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">Respond to review</h2>
            <div className="space-y-2 mb-4">
              <p>
                <span className="font-semibold">Name:</span> {selected.userName}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {selected.email}
              </p>
              <p>
                <span className="font-semibold">Rating:</span> {"⭐".repeat(selected.rating || 0)}
              </p>
              <p>
                <span className="font-semibold">Review:</span>
                <div className="mt-2 p-3 bg-gray-100 border rounded max-h-40 overflow-y-auto text-gray-700 text-sm">
                  {selected.review}
                </div>
              </p>
            </div>

            <div className="mb-4">
              <label className="font-semibold block mb-1">Status</label>
              <select
                value={selected.status}
                onChange={(e) => setSelected({ ...selected, status: e.target.value as Status })}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Approved">Approved</option>
                <option value="Hide">Hide</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => handleDelete(selected)}
              >
                Delete
              </button>
              <button
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => handleUpdate(selected)}
              >
                Update
              </button>
              <button
                className="px-3 py-1 rounded bg-gray-400 text-white hover:bg-gray-500"
                onClick={() => setSelected(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Reviews;
