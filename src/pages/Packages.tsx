import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import { FaBoxArchive, FaCube, FaPlus, FaMagnifyingGlass, FaPenToSquare, FaTrash } from "react-icons/fa6";
import ApiService from "../services/ApiService";
import toast, { Toaster } from "react-hot-toast";

interface Itinerary {
  day: number;
  title: string;
  details: string;
}

interface Package {
  _id: string;
  title: string;
  category: string;
  type: string;
  status: string;
  price: number;
  currency: string;
  duration: string;
  maxPeople?: number;
  difficulty?: string;
  description?: string;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  location?: string;
  mainImage?: string;
  images?: Array<{ url: string; alt: string }>;
  itinerary?: Itinerary[];
  slug: string;
}

const getCategories = (pkgs: Package[]) => ["All", ...Array.from(new Set(pkgs.map((p) => p.type || ""))).filter(Boolean)];

const defaultForm = {
  title: "",
  price: "",
  currency: "USD",
  duration: "",
  category: "Maldives",
  type: "MULTI DAY TOURS",
  status: "Active",
  maxPeople: "",
  difficulty: "",
  description: "",
  highlights: "",
  inclusions: "",
  exclusions: "",
  location: "",
  mainImage: null as File | null,
  images: [] as File[],
  itinerary: [] as Itinerary[],
};

const Packages: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });
  const [editId, setEditId] = useState<string | null>(null);

  const categories = getCategories(packages);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getPackages();
      setPackages(data as Package[]);
    } catch (err: any) {
      toast.error(err.error || "Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    const matchesCategory = category === "All" || pkg.type === category;
    const matchesSearch = pkg.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPackages = packages.length;
  const activePackages = packages.filter((pkg) => pkg.status === "Active").length;

  const openAddModal = () => {
    setForm({ ...defaultForm });
    setIsEdit(false);
    setModalOpen(true);
    setEditId(null);
  };

  const openEditModal = (pkg: Package) => {
    setForm({
      title: pkg.title,
      price: pkg.price.toString(),
      currency: pkg.currency || "USD",
      duration: pkg.duration || "",
      category: pkg.category,
      type: pkg.type,
      status: pkg.status || "Active",
      maxPeople: pkg.maxPeople?.toString() || "",
      difficulty: pkg.difficulty || "",
      description: pkg.description || "",
      highlights: pkg.highlights?.join(", ") || "",
      inclusions: pkg.inclusions?.join(", ") || "",
      exclusions: pkg.exclusions?.join(", ") || "",
      location: pkg.location || "",
      mainImage: null,
      images: [],
      itinerary: pkg.itinerary || [],
    });
    setIsEdit(true);
    setModalOpen(true);
    setEditId(pkg._id);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    if (name === "images") {
      const selectedFiles = Array.from(files || []) as File[];
      setForm((f) => ({ ...f, images: selectedFiles.slice(0, 5) }));
    } else if (name === "mainImage") {
      setForm((f) => ({ ...f, mainImage: files?.[0] || null }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleItineraryChange = (index: number, field: keyof Itinerary, value: string | number) => {
    const updated = [...form.itinerary];
    updated[index] = { ...updated[index], [field]: field === "day" ? Number(value) : value };
    setForm((f) => ({ ...f, itinerary: updated }));
  };

  const addItinerary = () => {
    setForm((f) => ({ ...f, itinerary: [...f.itinerary, { day: f.itinerary.length + 1, title: "", details: "" }] }));
  };

  const removeItinerary = (index: number) => {
    const updated = [...form.itinerary];
    updated.splice(index, 1);
    setForm((f) => ({ ...f, itinerary: updated }));
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setForm({ ...defaultForm });
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      const highlightsArr = form.highlights ? form.highlights.split(",").map(s => s.trim()) : [];
      const inclusionsArr = form.inclusions ? form.inclusions.split(",").map(s => s.trim()) : [];
      const exclusionsArr = form.exclusions ? form.exclusions.split(",").map(s => s.trim()) : [];

      Object.entries(form).forEach(([key, val]) => {
        if (key === "images") {
          (val as File[]).forEach(img => formData.append("images", img));
        } else if (key === "mainImage") {
          if (val) formData.append("mainImage", val as File);
        } else if (key === "highlights") {
          highlightsArr.forEach(h => formData.append("highlights[]", h));
        } else if (key === "inclusions") {
          inclusionsArr.forEach(i => formData.append("inclusions[]", i));
        } else if (key === "exclusions") {
          exclusionsArr.forEach(e => formData.append("exclusions[]", e));
        } else if (key === "itinerary") {
          (val as Itinerary[]).forEach((item, idx) => {
            formData.append(`itinerary[${idx}][day]`, item.day.toString());
            formData.append(`itinerary[${idx}][title]`, item.title);
            formData.append(`itinerary[${idx}][details]`, item.details);
          });
        } else {
          formData.append(key, val as any);
        }
      });

      if (isEdit && editId) {
        await ApiService.updatePackage(editId, formData);
        toast.success("Package updated successfully");
      } else {
        await ApiService.createPackage(formData);
        toast.success("Package added successfully");
      }

      await loadPackages();
      handleModalClose();
    } catch (err: any) {
      toast.error(err.error || "Failed to save package");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    try {
      await ApiService.deletePackage(id);
      toast.success("Package deleted successfully");
      await loadPackages();
    } catch (err: any) {
      toast.error(err.error || "Failed to delete package");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <>
      <Toaster position="top-right" />
      <Navbar />
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 ml-64 pt-28 px-8">
          <Header title="Package Management" description="Organize travel packages and experiences" />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center p-6 bg-white rounded-xl shadow border-l-4 border-blue-500">
              <FaBoxArchive className="text-blue-500 text-4xl mr-4" />
              <div>
                <div className="text-gray-500 font-medium">Total Packages</div>
                <div className="text-2xl font-bold">{totalPackages}</div>
              </div>
            </div>
            <div className="flex items-center p-6 bg-white rounded-xl shadow border-l-4 border-purple-500">
              <FaCube className="text-purple-500 text-4xl mr-4" />
              <div>
                <div className="text-gray-500 font-medium">Active Packages</div>
                <div className="text-2xl font-bold">{activePackages}</div>
              </div>
            </div>
          </div>

          {/* Filter/Search */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search Packages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  Type: {cat}
                </option>
              ))}
            </select>
            <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              <FaPlus /> Add Package
            </button>
          </div>

          {/* Packages Table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full table-auto">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2">Package Name</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Destination</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      No packages found.
                    </td>
                  </tr>
                ) : (
                  filteredPackages.map((pkg) => (
                    <tr key={pkg._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{pkg.title}</td>
                      <td className="px-4 py-2">{pkg.type}</td>
                      <td className="px-4 py-2">{pkg.category}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium text-white ${
                            pkg.status === "Active" ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          {pkg.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{pkg.currency === "USD" ? "US$" : "Rs."}{pkg.price.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">
                        <FaPenToSquare className="inline cursor-pointer mr-3 text-gray-600 hover:text-blue-500" onClick={() => openEditModal(pkg)} />
                        <FaTrash className="inline cursor-pointer text-red-500 hover:text-red-700" onClick={() => handleDelete(pkg._id)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">{isEdit ? "Edit Package" : "Add Package"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Title */}
              <input name="title" value={form.title} onChange={handleFormChange} placeholder="Package Title" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />

              {/* Price/Currency */}
              <div className="flex gap-2">
                <input name="price" value={form.price} onChange={handleFormChange} type="number" placeholder="Price" className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                <select name="currency" value={form.currency} onChange={handleFormChange} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="USD">USD</option>
                  <option value="LKR">LKR</option>
                </select>
              </div>

              {/* Duration/Location */}
              <div className="flex gap-2">
                <input name="duration" value={form.duration} onChange={handleFormChange} placeholder="Duration" className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                <input name="location" value={form.location} onChange={handleFormChange} placeholder="Location" className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Category/Type/Status */}
              <div className="flex gap-2">
                <select name="category" value={form.category} onChange={handleFormChange} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Maldives">Maldives</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                </select>
                <select name="type" value={form.type} onChange={handleFormChange} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="MULTI DAY TOURS">Multi Day Tours</option>
                  <option value="EXPERIENCES">Experiences</option>
                  <option value="DAY TRIPS">Day Trips</option>
                </select>
                <select name="status" value={form.status} onChange={handleFormChange} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Difficulty */}
              <select name="difficulty" value={form.difficulty} onChange={handleFormChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Select Difficulty</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              {/* Description */}
              <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Description" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />

              {/* Highlights / Inclusions / Exclusions */}
              <input name="highlights" value={form.highlights} onChange={handleFormChange} placeholder="Highlights (comma separated)" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input name="inclusions" value={form.inclusions} onChange={handleFormChange} placeholder="Inclusions (comma separated)" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input name="exclusions" value={form.exclusions} onChange={handleFormChange} placeholder="Exclusions (comma separated)" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />

              {/* Main Image */}
              <div>
                <label className="block mb-1 font-medium">Main Image</label>
                <input type="file" name="mainImage" accept="image/*" onChange={handleFormChange} className="w-full border rounded-lg px-3 py-2" />
                {form.mainImage && (
                  <img src={URL.createObjectURL(form.mainImage)} alt="Main Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                )}
              </div>

              {/* Other Images */}
              <div>
                <label className="block mb-1 font-medium">Other Images (Max 5)</label>
                <input type="file" name="images" accept="image/*" multiple onChange={handleFormChange} className="w-full border rounded-lg px-3 py-2" />
                {form.images.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {form.images.map((img, idx) => (
                      <img key={idx} src={URL.createObjectURL(img)} alt={`Preview ${idx + 1}`} className="w-24 h-24 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>

              {/* Itinerary */}
              <div>
                <label className="block mb-1 font-medium">Itinerary</label>
                {form.itinerary.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <input type="number" value={item.day} onChange={(e) => handleItineraryChange(idx, "day", e.target.value)} className="w-16 border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Day" />
                    <input type="text" value={item.title} onChange={(e) => handleItineraryChange(idx, "title", e.target.value)} className="flex-1 border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Title" />
                    <input type="text" value={item.details} onChange={(e) => handleItineraryChange(idx, "details", e.target.value)} className="flex-1 border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Details" />
                    <button type="button" onClick={() => removeItinerary(idx)} className="text-red-500 font-bold px-2">X</button>
                  </div>
                ))}
                <button type="button" onClick={addItinerary} className="text-blue-600 font-bold">+ Add Day</button>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={handleModalClose} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">{isEdit ? "Update" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Packages;
