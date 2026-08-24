import React from 'react';
import { CaretRight } from '@phosphor-icons/react';

/**
 * Pagination Component
 * Renders the page navigation controls positioned at the bottom of the data table.
 */
function Pagination() {
  return (
    <div className="pagination-container">
      <div className="showing-text">Showing : 1 - 25 of 150</div>
      
      <div className="pagination">
        <button className="page-btn active">1</button>
        <button className="page-btn">2</button>
        <button className="page-btn">3</button>
        <span className="page-dots">...</span>
        <button className="page-btn">6</button>
        <button className="page-btn next-btn">
          <CaretRight weight="bold" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
