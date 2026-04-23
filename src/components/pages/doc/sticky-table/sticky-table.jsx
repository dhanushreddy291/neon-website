'use client';

import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

const StickyTable = ({ children }) => {
  const rootRef = useRef(null);
  const geometryRef = useRef({ stickyTop: 0, headerHeight: 0 });
  const [layout, setLayout] = useState(null);
  const [scroll, setScroll] = useState({ active: false, scrollLeft: 0 });

  useEffect(() => {
    const root = rootRef.current;
    const wrapper = root?.querySelector('.table-wrapper');
    const table = wrapper?.querySelector('table');
    const thead = table?.querySelector('thead');

    if (!wrapper || !table || !thead) return undefined;

    const measure = () => {
      const wrapperRect = wrapper.getBoundingClientRect();
      const tableRect = table.getBoundingClientRect();
      const headerRect = thead.getBoundingClientRect();
      const stickyTop =
        parseFloat(getComputedStyle(root).getPropertyValue('--docs-header-height')) || 0;

      geometryRef.current = { stickyTop, headerHeight: headerRect.height };

      setLayout({
        columnWidths: Array.from(thead.querySelectorAll('th')).map(
          (cell) => cell.getBoundingClientRect().width
        ),
        headerHtml: thead.innerHTML,
        left: wrapperRect.left,
        tableWidth: tableRect.width,
        width: wrapperRect.width,
      });
    };

    const updateScroll = () => {
      const { stickyTop, headerHeight } = geometryRef.current;
      const tableRect = table.getBoundingClientRect();
      const headerRect = thead.getBoundingClientRect();
      const active = headerRect.top <= stickyTop && tableRect.bottom > stickyTop + headerHeight;
      const scrollLeft = wrapper.scrollLeft;

      setScroll((prev) =>
        prev.active === active && prev.scrollLeft === scrollLeft ? prev : { active, scrollLeft }
      );
    };

    const onResize = () => {
      measure();
      updateScroll();
    };

    measure();
    updateScroll();

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(wrapper);
    resizeObserver.observe(table);

    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', onResize);
    wrapper.addEventListener('scroll', updateScroll, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', onResize);
      wrapper.removeEventListener('scroll', updateScroll);
    };
  }, []);

  return (
    <div className="sticky-table" ref={rootRef}>
      {layout && (
        <div
          className="sticky-table-header"
          aria-hidden="true"
          style={{
            left: layout.left,
            opacity: scroll.active ? 1 : 0,
            width: layout.width,
          }}
        >
          <table
            style={{
              tableLayout: 'fixed',
              transform: `translateX(-${scroll.scrollLeft}px)`,
              width: layout.tableWidth,
            }}
          >
            <colgroup>
              {layout.columnWidths.map((width, index) => (
                <col key={index} style={{ width }} />
              ))}
            </colgroup>
            <thead dangerouslySetInnerHTML={{ __html: layout.headerHtml }} />
          </table>
        </div>
      )}
      {children}
    </div>
  );
};

StickyTable.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StickyTable;
