import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // Basic button styling is now in globals.css, so inline styles for buttons can be removed if they match.
  return (
    <div className="pagination"> {/* Replaced inline styles with className */}
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        // style removed, will be covered by globals.css button styling
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        // style removed, will be covered by globals.css button styling
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
