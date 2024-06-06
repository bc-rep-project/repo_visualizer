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


import React, { useMemo, useRef, useState, useEffect } from 'react';
import { hierarchy, pack, select } from 'd3';
import { scaleSqrt } from 'd3';
import './Tree.css';

// Define color encoding and file colors (example values)
const colorEncoding = {
  js: '#f0db4f',
  ts: '#007acc',
  json: '#292929',
  default: '#ccc',
};

const getColor = (extension) => colorEncoding[extension] || colorEncoding.default;

const Tree = ({ data }) => {
  const svgRef = useRef(null);
  const cachedPositions = useRef({});
  const cachedOrders = useRef({});
  const [selectedNode, setSelectedNode] = useState(null);

  const packedData = useMemo(() => {
    const root = hierarchy(data).sum(d => d.size || 1);
    return pack().size([800, 800]).padding(3)(root);
  }, [data]);

  useEffect(() => {
    renderTree();
  }, [packedData]);

  const processChild = (child, i) => {
    const fileExtension = child.data.type === 'file' ? child.data.path.split('.').pop() : '';
    const size = child.data.size || 1;
    const color = getColor(fileExtension);
    const sortOrder = cachedOrders.current[child.data.path] || i;

    return {
      ...child,
      size,
      color,
      sortOrder,
    };
  };

  const reflowSiblings = (siblings, parentRadius, parentPosition) => {
    const simulation = d3.forceSimulation(siblings)
      .force('x', d3.forceX(parentPosition[0]).strength(0.5))
      .force('y', d3.forceY(parentPosition[1]).strength(0.5))
      .force('collide', d3.forceCollide(d => d.r + 2))
      .stop();

    for (let i = 0; i < 120; ++i) simulation.tick();

    siblings.forEach(s => {
      cachedPositions.current[s.data.path] = [s.x, s.y];
    });
  };

  const renderTree = () => {
    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const nodes = packedData.descendants().map((d, i) => processChild(d, i));

    nodes.forEach(node => {
      if (node.depth > 0 && node.parent) {
        reflowSiblings(node.parent.children, node.parent.r, [node.parent.x, node.parent.y]);
      }
    });

    svg.selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.r)
      .attr('fill', d => d.color)
      .attr('stroke', d => d.data.path === selectedNode ? 'red' : '#000')
      .on('click', d => setSelectedNode(d.data.path));
  };

  return (
    <svg ref={svgRef} width={800} height={800}>
    </svg>
  );
};

export default Tree;