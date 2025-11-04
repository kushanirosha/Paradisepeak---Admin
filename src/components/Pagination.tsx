import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const paginate = (page: number) => onPageChange(page);

  return (
    <div className="pagination">
      <button className="btn btn-outline" onClick={() => paginate(1)} disabled={currentPage === 1}>
        First
      </button>
      <button
        className="btn btn-outline"
        disabled={currentPage === 1}
        onClick={() => paginate(currentPage - 1)}
      >
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index + 1}
          className={currentPage === index + 1 ? "active" : ""}
          onClick={() => paginate(index + 1)}
        >
          {index + 1}
        </button>
      ))}

      <button
        className="btn btn-outline"
        disabled={currentPage === totalPages}
        onClick={() => paginate(currentPage + 1)}
      >
        Next
      </button>
      <button className="btn btn-outline" onClick={() => paginate(totalPages)} disabled={currentPage === totalPages}>
        Last
      </button>
    </div>
  );
};

export default Pagination;
