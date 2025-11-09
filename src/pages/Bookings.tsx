import { useEffect, useState } from "react";
import { Eye, X, Save, Mail } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import ApiService from "../services/ApiService";
import jsPDF from "jspdf";

const api = import.meta.env.VITE_ADMIN_URL;
const resources = import.meta.env.VITE_RESOURCES_URL;

interface Booking {
  _id: string;
  packageId: string;
  packageName: string;
  name: string;
  email: string;
  phone: string;
  travelersCount: number;
  dateFrom: string;
  dateTo: string;
  specialRequests: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  paymentSlip?: string;
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterPackage, setFilterPackage] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [packages, setPackages] = useState<string[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");
  const [updatedStatus, setUpdatedStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Fixed PDF Download with proper image loading
  const handleDownloadPDF = async () => {
    if (!selectedBooking) return;
    setDownloadingPDF(true);

    const doc = new jsPDF();
    const marginLeft = 20;
    let y = 20;

    doc.setFontSize(18);
    doc.text("Booking Details", marginLeft, y);
    y += 15;

    doc.setFontSize(11);
    doc.text(`Booking ID: ${selectedBooking._id}`, marginLeft, y); y += 8;
    doc.text(`Status: ${selectedBooking.status}`, marginLeft, y); y += 8;
    doc.text(`Created: ${new Date(selectedBooking.createdAt).toLocaleString()}`, marginLeft, y); y += 12;

    doc.setFontSize(14);
    doc.text("Customer Information", marginLeft, y); y += 10;
    doc.setFontSize(11);
    doc.text(`Name: ${selectedBooking.name}`, marginLeft, y); y += 7;
    doc.text(`Email: ${selectedBooking.email}`, marginLeft, y); y += 7;
    doc.text(`Phone: ${selectedBooking.phone}`, marginLeft, y); y += 12;

    doc.setFontSize(14);
    doc.text("Travel Details", marginLeft, y); y += 10;
    doc.setFontSize(11);
    doc.text(`Package: ${selectedBooking.packageName}`, marginLeft, y); y += 7;
    doc.text(`Travelers: ${selectedBooking.travelersCount}`, marginLeft, y); y += 7;
    doc.text(`Dates: ${new Date(selectedBooking.dateFrom).toLocaleDateString()} - ${new Date(selectedBooking.dateTo).toLocaleDateString()}`, marginLeft, y); y += 12;

    if (selectedBooking.specialRequests) {
      doc.setFontSize(14);
      doc.text("Special Requests:", marginLeft, y); y += 8;
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(selectedBooking.specialRequests, 170);
      doc.text(splitText, marginLeft, y);
      y += splitText.length * 5 + 10;
    }

    if (selectedBooking.paymentSlip) {
      try {
        const imageUrl = `${resources}${selectedBooking.paymentSlip}`;
        const imgData = await new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/jpeg", 0.8));
            }
          };
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = imageUrl;
        });

        doc.setFontSize(14);
        doc.text("Payment Slip:", marginLeft, y); y += 10;
        const imgWidth = 100;
        const imgHeight = 70;
        doc.addImage(imgData, "JPEG", marginLeft, y, imgWidth, imgHeight);
        y += imgHeight + 10;
      } catch (err) {
        doc.setFontSize(10);
        doc.text("Payment slip image could not be loaded.", marginLeft, y); y += 10;
      }
    }

    doc.save(`Booking_${selectedBooking._id}.pdf`);
    setDownloadingPDF(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingsData: Booking[] = await ApiService.getBookings();
        setBookings(bookingsData);
        const uniquePackages = Array.from(
          new Set(bookingsData.map((b) => b.packageName))
        );
        setPackages(uniquePackages);
      } catch (error) {
        toast.error("API not ready, loading fallback data");
        const fallbackData: Booking[] = [
          {
            _id: "69103fe757232199b3179dc6",
            packageId: "69103f7a57232199b3179dad",
            packageName: "cjbwasdi",
            name: "user",
            email: "user@gmail.com",
            phone: "432424",
            travelersCount: 1,
            dateFrom: "2025-11-19T00:00:00.000+00:00",
            dateTo: "2025-11-19T00:00:00.000+00:00",
            specialRequests: "3463",
            status: "New",
            createdAt: "2025-11-09T07:16:55.111+00:00",
            updatedAt: "2025-11-09T07:16:55.111+00:00",
            paymentSlip: "/uploads/paymentSlips/1762672615095-Screenshot 2025-10-05 191612.png",
          },
        ];
        setBookings(fallbackData);
        setPackages(["cjbwasdi"]);
      }
    };
    fetchData();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const matchesPkg = !filterPackage || b.packageName === filterPackage;
    const matchesStatus = !filterStatus || b.status === filterStatus;
    const matchesEmail =
      !searchEmail || b.email.toLowerCase().includes(searchEmail.toLowerCase());
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      const from = new Date(b.dateFrom);
      const to = new Date(b.dateTo);
      matchesDate = to >= start && from <= end;
    }
    return matchesPkg && matchesStatus && matchesEmail && matchesDate;
  });

  const uniqueStatuses = Array.from(new Set(bookings.map((b) => b.status)));

  const openBookingDetails = (b: Booking) => {
    setSelectedBooking(b);
    setUpdatedStatus(b.status);
    setInternalNotes("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    setInternalNotes("");
    setUpdatedStatus("");
  };

  const handleSaveChanges = async () => {
    if (!selectedBooking || !updatedStatus) return;

    setSaving(true);
    try {
      const res = await fetch(`${api}/bookings/${selectedBooking._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: updatedStatus, internalNotes }),
      });

      if (!res.ok) throw new Error("Failed to update booking");

      const updated = bookings.map((b) =>
        b._id === selectedBooking._id ? { ...b, status: updatedStatus } : b
      );
      setBookings(updated);
      toast.success(`Booking updated to ${updatedStatus}`);
      closeModal();
    } catch (error) {
      toast.error("Failed to update booking status");
    } finally {
      setSaving(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!selectedBooking) return;
    try {
      await ApiService.resendBookingConfirmation({
        bookingId: selectedBooking._id,
        customerEmail: selectedBooking.email,
        customerName: selectedBooking.name,
        packageName: selectedBooking.packageName,
        status: updatedStatus || selectedBooking.status,
        dateFrom: selectedBooking.dateFrom,
        dateTo: selectedBooking.dateTo,
        travelersCount: selectedBooking.travelersCount,
        specialRequests: selectedBooking.specialRequests,
      });
      toast.success(`Confirmation email sent to ${selectedBooking.email}`);
    } catch (error) {
      toast.error("Failed to send email");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <Header
        title="Booking Management"
        description="Manage customer bookings and handle status updates."
      />

      <main className="ml-64 px-8 pt-28">
        {/* Filters */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow flex flex-wrap gap-4 items-center mb-6">
          <select
            className="border rounded-lg p-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {uniqueStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            className="border rounded-lg p-2"
            value={filterPackage}
            onChange={(e) => setFilterPackage(e.target.value)}
          >
            <option value="">All Packages</option>
            {packages.map((pkg) => (
              <option key={pkg} value={pkg}>{pkg}</option>
            ))}
          </select>

          <input
            type="date"
            className="border rounded-lg p-2"
            value={dateRange.start}
            onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
          />
          <input
            type="date"
            className="border rounded-lg p-2"
            value={dateRange.end}
            onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
          />

          <input
            type="text"
            placeholder="Search by email"
            className="border rounded-lg p-2 flex-1"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Booking ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Package</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Dates</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
                  <tr key={b._id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{b._id}</td>
                    <td className="px-4 py-3">{b.name}</td>
                    <td className="px-4 py-3">{b.email}</td>
                    <td className="px-4 py-3">{b.packageName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          b.status === "Confirmed"
                            ? "bg-green-100 text-green-700"
                            : b.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : b.status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : b.status === "New"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(b.dateFrom).toLocaleDateString()} -{" "}
                      {new Date(b.dateTo).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openBookingDetails(b)}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500 italic">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal - FULLY FIXED */}
        {isModalOpen && selectedBooking && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-1/2 max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
                <h2 className="font-bold text-lg">Booking #{selectedBooking._id}</h2>
                <button onClick={closeModal} className="hover:bg-white/20 p-2 rounded-lg transition">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5 text-sm">
                {/* Customer */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Customer</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{selectedBooking.name}</p>
                    <p className="text-gray-600">{selectedBooking.email}</p>
                    <p className="text-gray-600">{selectedBooking.phone}</p>
                  </div>
                </div>

                {/* Package & Travel */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Package & Travel</h3>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <p><strong>Package:</strong> {selectedBooking.packageName}</p>
                    <p><strong>Travelers:</strong> {selectedBooking.travelersCount}</p>
                    <p><strong>Dates:</strong> {new Date(selectedBooking.dateFrom).toLocaleDateString()} - {new Date(selectedBooking.dateTo).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Special Requests</h3>
                    <p className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-gray-800">
                      {selectedBooking.specialRequests}
                    </p>
                  </div>
                )}

                {/* Payment Slip */}
                {selectedBooking.paymentSlip && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Payment Slip</h3>
                    <a
                      href={`${resources}${selectedBooking.paymentSlip}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={`${resources}${selectedBooking.paymentSlip}`}
                        alt="Payment Slip"
                        className="rounded-lg border-2 border-gray-200 w-full max-w-md object-contain hover:opacity-90 transition cursor-pointer"
                      />
                    </a>
                  </div>
                )}

                {/* Status Update */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {["New", "Confirmed", "Pending", "Cancelled", "Completed"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setUpdatedStatus(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          updatedStatus === status
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Internal Notes */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Internal Notes</h3>
                  <textarea
                    className="w-full border rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="Add notes visible only to admin team..."
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-4 border-t">
                  <button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-white font-medium transition ${
                      saving ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    onClick={handleResendConfirmation}
                    className="flex items-center justify-center gap-2 px-5 py-3 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition"
                  >
                    <Mail size={18} /> Resend Confirmation Email
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloadingPDF}
                    className="flex items-center justify-center gap-2 px-5 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition"
                  >
                    <Save size={18} /> {downloadingPDF ? "Generating PDF..." : "Download PDF"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}