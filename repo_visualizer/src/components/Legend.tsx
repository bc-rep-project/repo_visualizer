import React from 'react';
import './legend.css';

const Legend: React.FC = () => {
  return (
    <div className="legend">
      <h3>Legend</h3>
      <ul>
        <li>
          <span className="circle directory"></span> Directory
        </li>
        <li>
          <span className="circle file"></span> File
        </li>
        <li>
          <svg width="20" height="20">
            <line x1="5" y1="10" x2="15" y2="10" stroke="black" strokeWidth="2" />
          </svg> Import Relationship
        </li>
        {/* Add more legend items as needed  */}
      </ul>
    </div>
  );
};

export default Legend;