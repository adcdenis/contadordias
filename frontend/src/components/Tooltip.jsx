import React from 'react';

const Tooltip = ({ content, children, placement = 'bottom' }) => {
  const positions = {
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  const posClass = positions[placement] || positions.bottom;

  return (
    <div className="relative inline-flex group">
      {children}
      {content ? (
        <div
          role="tooltip"
          className={`absolute ${posClass} z-20 hidden group-hover:block px-2 py-1 text-xs rounded bg-gray-900 text-white whitespace-nowrap shadow-lg`}
        >
          {content}
        </div>
      ) : null}
    </div>
  );
};

export default Tooltip;