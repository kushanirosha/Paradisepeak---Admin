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

  const handleDownloadPDF = () => {
    if (!selectedBooking) return;

    const doc = new jsPDF();
    const marginLeft = 20;
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.text("Booking Details", marginLeft, y);
    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(100);

    // Booking ID & Date
    doc.text(`Booking ID: ${selectedBooking._id}`, marginLeft, (y += 10));
    doc.text(`Status: ${selectedBooking.status}`, marginLeft, (y += 8));
    doc.text(
      `Created At: ${new Date(selectedBooking.createdAt).toLocaleDateString()}`,
      marginLeft,
      (y += 8)
    );

    y += 10;
    doc.setDrawColor(180);
    doc.line(marginLeft, y, 190, y);
    y += 10;

    // Customer Info
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text("Customer Details", marginLeft, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Name: ${selectedBooking.name}`, marginLeft, (y += 8));
    doc.text(`Email: ${selectedBooking.email}`, marginLeft, (y += 8));
    doc.text(`Phone: ${selectedBooking.phone}`, marginLeft, (y += 8));

    y += 10;
    doc.line(marginLeft, y, 190, y);
    y += 10;

    // Package Info
    doc.setFontSize(14);
    doc.text("Package Details", marginLeft, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Package: ${selectedBooking.packageName}`, marginLeft, (y += 8));
    doc.text(
      `Travel Dates: ${new Date(
        selectedBooking.dateFrom
      ).toLocaleDateString()} - ${new Date(
        selectedBooking.dateTo
      ).toLocaleDateString()}`,
      marginLeft,
      (y += 8)
    );
    doc.text(
      `Travelers Count: ${selectedBooking.travelersCount}`,
      marginLeft,
      (y += 8)
    );

    if (selectedBooking.specialRequests) {
      y += 10;
      doc.text("Special Requests:", marginLeft, y);
      const splitText = doc.splitTextToSize(selectedBooking.specialRequests, 170);
      doc.text(splitText, marginLeft, (y += 8));
      y += splitText.length * 6;
    }

    y += 10;
    doc.line(marginLeft, y, 190, y);
    y += 10;

    // Payment Slip
    if (selectedBooking.paymentSlip) {
      doc.setFontSize(14);
      doc.text("Payment Slip", marginLeft, y);
      y += 10;

      const imageUrl = `${resources}${selectedBooking.paymentSlip}`;
      const img = new Image();
      img.src = imageUrl;

      img.onload = () => {
        const imgWidth = 100;
        const imgHeight = (img.height * imgWidth) / img.width;
        doc.addImage(img, "JPEG", marginLeft, y, imgWidth, imgHeight);
        y += imgHeight + 20;

        doc.save(`Booking_${selectedBooking._id}.pdf`);
      };

      img.onerror = () => {
        doc.text("Failed to load payment slip image.", marginLeft, y);
        doc.save(`Booking_${selectedBooking._id}.pdf`);
      };
    } else {
      doc.save(`Booking_${selectedBooking._id}.pdf`);
    }
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
            _id: "BK001",
            packageId: "1",
            packageName: "Beach Paradise",
            name: "John Smith",
            email: "john@gmail.com",
            phone: "+94771230001",
            travelersCount: 2,
            dateFrom: "2025-01-10",
            dateTo: "2025-01-15",
            specialRequests: "Need sea view room",
            status: "Confirmed",
            createdAt: "2025-01-10",
            updatedAt: "2025-01-10",
          },
        ];
        setBookings(fallbackData);
        setPackages(["Beach Paradise"]);
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
      toast.success(`Email sent to ${selectedBooking.email}`);
    } catch (error) {
      toast.error("Failed to send confirmation email");
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
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="border rounded-lg p-2"
            value={filterPackage}
            onChange={(e) => setFilterPackage(e.target.value)}
          >
            <option value="">All Packages</option>
            {packages.map((pkg) => (
              <option key={pkg} value={pkg}>
                {pkg}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="border rounded-lg p-2"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
          />
          <input
            type="date"
            className="border rounded-lg p-2"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
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
                  <tr
                    key={b._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
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
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && selectedBooking && (
          <div className="fixed inset-0 bg-black/80 bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="flex justify-between items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <h2 className="font-semibold text-sm">
                  Booking #{selectedBooking._id}
                </h2>
                <button
                  onClick={closeModal}
                  className="hover:bg-white/20 p-1 rounded"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold text-gray-600 mb-1">Customer</h3>
                  <p>{selectedBooking.name}</p>
                  <p className="text-gray-500">{selectedBooking.email}</p>
                  <p className="text-gray-500">{selectedBooking.phone}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-600 mb-1">Package</h3>
                  <p>{selectedBooking.packageName}</p>
                </div>

                {selectedBooking.paymentSlip && (
                  <div>
                    <h3 className="font-semibold text-gray-600 mb-1">Payment Slip</h3>
                    <a
                      href={`${resources}${selectedBooking.paymentSlip}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={`${resources}${selectedBooking.paymentSlip}`}
                        alt="Payment Slip"
                        className="rounded-lg border w-[150px] max-h-64 object-contain hover:opacity-90 cursor-pointer"
                      />
                    </a>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-600 mb-1">Dates</h3>
                  <p>
                    {new Date(selectedBooking.dateFrom).toLocaleDateString()} -{" "}
                    {new Date(selectedBooking.dateTo).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-600 mb-1">
                    Update Status
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {["New", "Confirmed", "Pending", "Cancelled", "Completed"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => setUpdatedStatus(status)}
                          className={`px-3 py-1 text-xs font-semibold rounded ${
                            updatedStatus === status
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <textarea
                  className="w-full border rounded-lg p-2 text-sm"
                  rows={3}
                  placeholder="Internal notes..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                />

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white ${
                      saving
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    onClick={handleResendConfirmation}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50"
                  >
                    <Mail size={16} /> Resend Confirmation
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Save size={16} /> Download PDF
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
