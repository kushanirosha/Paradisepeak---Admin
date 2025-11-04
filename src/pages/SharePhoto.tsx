/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import ApiService from "../services/ApiService";
import toast, { Toaster } from "react-hot-toast";
import ReactPaginate from "react-paginate";

// type SharePhotoForm = {
//   package: string;
//   drivelink: string;
//   description: string;
//   _id?: string;
// };

const itemsPerPage = 10;

const UserPhotoSubmission: React.FC = () => {
  const [sharePhotos, setSharePhotos] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(0); // react-paginate uses 0-based page
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    ApiService.getAllPhotoSubmission(keyword)
      .then((res) => {
        if (res && res.data) {
          setSharePhotos(res.data);
          setPageCount(Math.ceil(res.data.length / itemsPerPage));
        }
      })
      .catch((err) => {
        console.error("Error fetching share photos:", err);
        toast.error("Failed to fetch share photos");
      });
  }, [keyword]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setCurrentPage(0); // reset to first page
  };

  // Slice the data for the current page
  const offset = currentPage * itemsPerPage;
  const currentSharePhotos = sharePhotos.slice(offset, offset + itemsPerPage);

  const handlePageClick = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected);
  };

  return (
    <>
      <Toaster position="top-right" />
      <Navbar />
      <div className="ml-64 pt-28 px-8 bg-gray-50 min-h-screen">
        <Header title="Share Photos" description="View and manage photo submissions" />

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-lg font-semibold text-gray-700">Share Photos</h2>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search..."
              value={keyword}
              onChange={handleSearch}
              className="w-full px-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-600 font-medium">Package Name</th>
                <th className="px-6 py-3 text-left text-gray-600 font-medium">Google Drive Link</th>
                <th className="px-6 py-3 text-left text-gray-600 font-medium">Description</th>
                <th className="px-6 py-3 text-left text-gray-600 font-medium">User Name</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentSharePhotos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400">
                    No items found.
                  </td>
                </tr>
              ) : (
                currentSharePhotos.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{item.package?.title || item.packageId?.title}</td>
                    <td className="px-6 py-4">
                      <a href={item.drivelink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {item.drivelink}
                      </a>
                    </td>
                    <td className="px-6 py-4">{item.description}</td>
                    <td className="px-6 py-4">{item.user?.name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* React Paginate */}
          <div className="p-4 flex justify-center">
            <ReactPaginate
              previousLabel={"Previous"}
              nextLabel={"Next"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              containerClassName={"flex gap-2"}
              pageClassName={"px-3 py-1 border rounded-md cursor-pointer hover:bg-blue-100"}
              activeClassName={"bg-blue-600 text-white"}
              previousClassName={"px-3 py-1 border rounded-md cursor-pointer hover:bg-blue-100"}
              nextClassName={"px-3 py-1 border rounded-md cursor-pointer hover:bg-blue-100"}
              breakClassName={"px-3 py-1 border rounded-md"}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default UserPhotoSubmission;
