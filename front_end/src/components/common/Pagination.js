import React from "react";
import { Pagination } from "react-bootstrap";

/**
 * Component Pagination reuse.
 * @param {object} props - Props cho component.
 * @param {number} props.currentPage - The current page is being selected.
 * @param {number} props.totalPages - Total number of pages.
 * @param {function} props.onPageChange - The callback function is called when the user changes the page.It receives a new page number.
 * @returns {JSX.Element|null} Component Pagination or Null if there is only one page.
 */
const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
  // Do not display a pages bar if there is only one page or no page
  if (totalPages <= 1) {
    return null;
  }

  /**
   * Processing clicking on a page.
   * @param {number} pageNumber - The number of pages is clicked.
   */
  const handlePageClick = (pageNumber) => {
    // Only call callback if the page is valid and not the current page
    if (
      pageNumber >= 1 &&
      pageNumber <= totalPages &&
      pageNumber !== currentPage
    ) {
      onPageChange(pageNumber);
    }
  };

  /**
   * Render the page number buttons with logic displaying "..." when there are too many pages.
   */
  const renderPageItems = () => {
    const items = [];
    const pageNeighbours = 2; // Number of surrounding pages displayed on each side of the current page

    const pageNumbers = [];
    const totalNumbers = pageNeighbours * 2 + 3; // The total number of page buttons will display (for example: 1, ..., 4, 5, 6, ..., 10)
    const totalBlocks = totalNumbers + 2; // The total number of blocks includes the "..."

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - pageNeighbours);
      const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);

      pageNumbers.push(1); // Always display page 1

      if (startPage > 2) {
        pageNumbers.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      pageNumbers.push(totalPages); // Always display the last page
    } else {
      // Show all pages if the total number of pages is not too large
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    }

    pageNumbers.forEach((page, index) => {
      if (page === "...") {
        items.push(<Pagination.Ellipsis key={`ellipsis-${index}`} disabled />);
      } else {
        items.push(
          <Pagination.Item
            key={page}
            active={page === currentPage}
            onClick={() => handlePageClick(page)}>
            {page}
          </Pagination.Item>
        );
      }
    });

    return items;
  };

  return (
    <Pagination className="justify-content-center my-4">
      <Pagination.First
        onClick={() => handlePageClick(1)}
        disabled={currentPage === 1}
      />
      <Pagination.Prev
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
      />
      {renderPageItems()}
      <Pagination.Next
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
      <Pagination.Last
        onClick={() => handlePageClick(totalPages)}
        disabled={currentPage === totalPages}
      />
    </Pagination>
  );
};

export default PaginationComponent;
