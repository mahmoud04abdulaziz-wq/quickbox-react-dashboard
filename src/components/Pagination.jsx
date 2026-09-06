import React from 'react';
import { useTranslation } from 'react-i18next';
import { CaretRight } from '@phosphor-icons/react';

/**
 * Pagination Component
 * Renders the page navigation controls positioned at the bottom of the data table.
 */
function Pagination() {
  const { t } = useTranslation('common');

  return (
    <div className="pagination-container">
      <div className="showing-text">{t('pagination.showing')} : 1 - 25 {t('pagination.of')} 150</div>
      
      <div className="pagination">
        <button className="page-btn active">1</button>
        <button className="page-btn">2</button>
        <button className="page-btn">3</button>
        <span className="page-dots">...</span>
        <button className="page-btn">6</button>
        <button className="page-btn next-btn" title={t('actions.next')}>
          <CaretRight weight="bold" className="icon-rtl-flip" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
