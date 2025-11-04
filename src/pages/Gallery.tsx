/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import { FaPlus, FaPenToSquare, FaTrash } from "react-icons/fa6";
import ApiService from "../services/ApiService";
import toast, { Toaster } from "react-hot-toast";
import ReactPaginate from "react-paginate";

type GalleryForm = {
  title: string;
  country: string;
  reorder: string;
  image: File | null;
  _id?: string;
};

const defaultForm: GalleryForm = {
  title: "",
  country: "Maldives",
  reorder: "",
  image: null,
};

const API_URL = "https://backend.paradisepeaktravels.com/api/v1/gallery";

const Gallery: React.FC = () => {
  const [gallery, setGallery] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<GalleryForm>({ ...defaultForm });
  // const [ setEditIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const pageCount = Math.ceil(gallery.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentGallery = gallery.slice(offset, offset + itemsPerPage);

  useEffect(() => {
    ApiService.getGallery()
      .then((data) => {
        if (data && data.data) {
          setGallery(data.data);
        }
      })
      .catch(() => {
        toast.error("Failed to fetch gallery items");
      });
  }, []);

  const openAddModal = () => {
    setForm({ ...defaultForm });
    setIsEdit(false);
    setModalOpen(true);
    // setEditIndex(null);
  };

  const openEditModal = (item: any, _idx: number) => {
    setForm({
      title: item.title,
      country: item.country,
      reorder: item.reorder,
      image: null,
      _id: item._id,
    });
    setIsEdit(true);
    setModalOpen(true);
    // setEditIndex(idx);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as any;
    if (name === "image") {
      setForm((f) => ({ ...f, image: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setForm({ ...defaultForm });
    // setEditIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const reorderValue = Math.max(1, Number(form.reorder));
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("country", form.country);
    formData.append("reorder", reorderValue.toString());
    if (form.image) formData.append("image", form.image);

    const token = localStorage.getItem("token");

    try {
      let res;
      if (isEdit && form._id) {
        res = await fetch(`${API_URL}/${form._id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to update gallery item");
        const updatedItem = (await res.json()).data;
        setGallery((prev) =>
          prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
        );
        toast.success("Gallery updated successfully");
      } else {
        res = await fetch(API_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to add gallery item");
        const newItem = await res.json();
        setGallery((prev) => [...prev, newItem]);
        toast.success("Gallery added successfully");
      }
      handleModalClose();
    } catch {
      toast.error(isEdit ? "Failed to update gallery" : "Failed to add gallery");
    }
  };

  const handleDelete = async (idx: number) => {
    const item = gallery[idx];
    if (!item?._id) return;
    if (!window.confirm("Are you sure you want to delete this gallery item?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/${item._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete gallery item");
      setGallery((prev) => prev.filter((_, i) => i !== idx));
      toast.success("Gallery deleted successfully");
    } catch {
      toast.error("Failed to delete gallery item");
    }
  };

  const handlePageClick = (data: { selected: number }) => {
    setCurrentPage(data.selected);
  };

  return (
    <>
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex min-h-screen bg-gray-50 font-sans">
        <div className="flex-1 ml-64 pt-28 px-8">
          <Header title="Gallery Management" description="Manage travel gallery photos" />

          <div className="flex items-center justify-between mb-4 mt-6">
            <h2 className="text-lg font-semibold text-gray-700">Gallery Items</h2>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <FaPlus /> Add Gallery
            </button>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="text-left p-4">Title</th>
                  <th className="text-left p-4">Image</th>
                  <th className="text-left p-4">Country</th>
                  <th className="text-left p-4">Reorder</th>
                  <th className="text-center p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentGallery.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-6 text-gray-400">
                      No gallery items found.
                    </td>
                  </tr>
                ) : (
                  currentGallery.map((item, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50 transition">
                      <td className="p-4">{item.title}</td>
                      <td className="p-4">
                        {item.image ? (
                          <img
                            src={`https://backend.paradisepeaktravels.com${item.image}`}
                            alt={item.title}
                            className="w-20 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <span className="text-gray-400">No image</span>
                        )}
                      </td>
                      <td className="p-4">{item.country}</td>
                      <td className="p-4">{item.reorder}</td>
                      <td className="p-4 text-center flex justify-center gap-4">
                        <FaPenToSquare
                          className="cursor-pointer text-gray-600 hover:text-blue-600"
                          size={18}
                          title="Edit"
                          onClick={() => openEditModal(item, idx)}
                        />
                        <FaTrash
                          className="cursor-pointer text-red-500 hover:text-red-600"
                          size={18}
                          title="Delete"
                          onClick={() => handleDelete(idx)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* React Paginate */}
            {pageCount > 1 && (
              <div className="p-4 flex justify-center">
                <ReactPaginate
                  previousLabel={"<"}
                  nextLabel={">"}
                  pageCount={pageCount}
                  onPageChange={handlePageClick}
                  containerClassName={"flex gap-2"}
                  pageClassName={"px-3 py-1 border rounded-md cursor-pointer"}
                  previousClassName={"px-3 py-1 border rounded-md cursor-pointer"}
                  nextClassName={"px-3 py-1 border rounded-md cursor-pointer"}
                  activeClassName={"bg-blue-600 text-white"}
                  disabledClassName={"opacity-50 cursor-not-allowed"}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">{isEdit ? "Edit Gallery" : "Add Gallery"}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="Gallery Title"
                className="border rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />
              <select
                name="country"
                value={form.country}
                onChange={handleFormChange}
                className="border rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                required
              >
                <option value="Maldives">Maldives</option>
                <option value="Sri Lanka">Sri Lanka</option>
              </select>
              <input
                name="reorder"
                type="number"
                min={1}
                value={form.reorder}
                onChange={handleFormChange}
                placeholder="Reorder"
                className="border rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />
              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium text-gray-700">Gallery Image</label>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="image"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition"
                  >
                    Choose File
                  </label>
                  <span className="text-gray-600">
                    {form.image ? form.image.name : "No file selected"}
                  </span>
                </div>
                <input
                  type="file"
                  name="image"
                  id="image"
                  accept="image/*"
                  onChange={handleFormChange}
                  className="hidden"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  {isEdit ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;
