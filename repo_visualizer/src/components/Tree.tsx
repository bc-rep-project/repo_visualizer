// import React, { useRef, useState, useMemo } from 'react';
// import { hierarchy, pack, select } from 'd3';
// import { scaleSqrt, scaleLinear } from 'd3';
// import * as d3 from 'd3';
// import './Tree.css';

// const Tree = ({ data }) => {
//   const svgRef = useRef(null);
//   const [selectedNode, setSelectedNode] = useState(null);

//   const packedData = useMemo(() => {
//     const root = hierarchy(data).sum(d => d.size);
//     return pack().size([800, 800]).padding(3)(root);
//   }, [data]);

//   const renderTree = () => {
//     const svg = select(svgRef.current);
//     svg.selectAll('*').remove();

//     const nodes = svg.selectAll('circle')
//       .data(packedData.descendants())
//       .enter().append('circle')
//       .attr('cx', d => d.x)
//       .attr('cy', d => d.y)
//       .attr('r', d => d.r)
//       .attr('fill', d => d.children ? '#555' : '#999')
//       .attr('stroke', d => d.data.path === selectedNode ? 'red' : '#000')
//       .on('click', d => setSelectedNode(d.data.path));
//   };

//     const processChild = (child, getColor, cachedOrders, i, fileColors) => {
//       const fileExtension = path.extname(child.path).substring(1);
//       const color = getColor(fileExtension);
//       const size = child.size || 1;
//       const sortOrder = cachedOrders.current[child.path] || i;
    
//       return {
//         ...child,
//         size,
//         color,
//         sortOrder,
//       };
//     };
    
//     const reflowSiblings = (siblings, cachedPositions, maxDepth, parentRadius, parentPosition) => {
//       // D3 force simulation to arrange siblings horizontally
//       const simulation = d3.forceSimulation(siblings)
//         .force('x', d3.forceX(d => parentPosition[0]).strength(0.5))
//         .force('y', d3.forceY(d => parentPosition[1]).strength(0.5))
//         .force('collide', d3.forceCollide(d => d.r + 2))
//         .stop();
    
//       for (let i = 0; i < 120; ++i) simulation.tick();
    
//       siblings.forEach(s => {
//         cachedPositions.current[s.path] = [s.x, s.y];
//       });
//     };

//   return (
//     <svg ref={svgRef} width={800} height={800}>
//       {renderTree()}
//     </svg>
//   );
// };

// export default Tree;


// src/components/Tree.tsx
import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
// import { ReactNode } from "react";

// Define TreeNode interface here
interface TreeNode {
  name: string;
  path: string;
  size: number;
  children?: TreeNode[];
  imports?: { importedModule: string, importingFile: string }[];
  x?: number;
  y?: number;
}

interface TreeProps {
  data: TreeNode;
}

const Tree: React.FC<TreeProps> = ({ data }) => {
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null); // Add this line

  // const getNodeColor = (nodePath: string) => {
  //   if (highlighted === nodePath) {
  //     return 'red'; // Highlighted node
  //   } else {
  //     return 'blue'; // Default node color
  //   }
  // };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = svg.node()?.getBoundingClientRect().width || 800;
    const height = svg.node()?.getBoundingClientRect().height || 600;

    // Create a hierarchical data structure from your data
    const root = d3.hierarchy(data);

    // Create a tree layout
    const treeLayout = d3.tree<TreeNode>().size([width, height - 100]); 

    // Calculate node positions using D3's tree layout
    treeLayout(root);

    // Update your nodes' x and y coordinates
    root.descendants().forEach(node => {
      // Optional: Adjust x for a left-to-right tree
      node.data.x = node.x || 0; 
      node.data.y = node.y || 0;
    });

    // Rest of your code...
  }, [data]);

  const getCoordinates = (filePath: string): { x: number, y: number } | null => {
    // Placeholder for coordinate logic
    return { x: Math.random() * 1000, y: Math.random() * 1000 };
  };

  const renderConnections = () => {
    const lines: JSX.Element[] = [];
    const processConnections = (node: TreeNode) => {
      if (node.imports) {
        node.imports.forEach(importObj => {
          const startPoint = getCoordinates(node.path);
          const endPoint = getCoordinates(importObj.importedModule);
          if (startPoint && endPoint) {
            lines.push(
              <line
                key={`${node.path}-${importObj.importedModule}`}
                x1={startPoint.x}
                y1={startPoint.y}
                x2={endPoint.x}
                y2={endPoint.y}
                stroke="black"
                strokeWidth="2"
                className={highlighted === node.path || highlighted === importObj.importedModule ? 'highlighted' : ''}
              />
            );
          }
        });
      }
      if (node.children) {
        node.children.forEach(child => processConnections(child));
      }
    };
    processConnections(data);
    return lines;
  };

  const handleMouseOver = (filePath: string) => {
    setHighlighted(filePath);
  };

  const handleMouseOut = () => {
    setHighlighted(null);
  };

  const renderTree = (node: TreeNode): JSX.Element => {
    return (
      <g
        key={node.path}
        onMouseOver={() => handleMouseOver(node.path)}
        onMouseOut={handleMouseOut}
      >
        <circle cx={node.x || 0} cy={node.y || 0} r={5} fill="blue" />
        {node.children && node.children.map(renderTree)}
      </g>
    );
  };

  return (
    <svg width="100%" height="100%">
      {renderConnections()}
      {renderTree(data)}
    </svg>
  );
};

export default Tree;