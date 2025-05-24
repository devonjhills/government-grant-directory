"use client"; // Keep this if it uses client-side logic

import React from "react";
import { Button } from "@/components/ui/button"; // Verify path

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Determine the range of page numbers to display
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (currentPage <= 3) {
    endPage = Math.min(totalPages, 5);
  }
  if (currentPage > totalPages - 3) {
    startPage = Math.max(1, totalPages - 4);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-center space-x-3 sm:space-x-4 mt-10 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="text-xs sm:text-sm px-3 py-1 rounded-md">
        Previous
      </Button>

      {startPage > 1 && ( // Show first page and ellipsis if not in the initial range
        <>
          <Button
            variant={currentPage === 1 ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(1)}
            className="text-xs sm:text-sm px-3 py-1 rounded-md">
            1
          </Button>
          {startPage > 2 && <span className="text-muted-foreground">...</span>}
        </>
      )}

      {pageNumbers.map((number) => (
        <Button
          key={number}
          variant={currentPage === number ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(number)}
          className="text-xs sm:text-sm px-3 py-1 rounded-md">
          {number}
        </Button>
      ))}

      {endPage < totalPages && ( // Show last page and ellipsis if not in the final range
        <>
          {endPage < totalPages - 1 && (
            <span className="text-muted-foreground">...</span>
          )}
          <Button
            variant={currentPage === totalPages ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className="text-xs sm:text-sm">
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="text-xs sm:text-sm">
        Next
      </Button>
    </div>
  );
};

export default Pagination;
