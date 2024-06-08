import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { TreeNode } from './types'; // Assuming you have a TreeNode type

interface ForceGraphProps {
  data: TreeNode;
}

const ForceGraph: React.FC<ForceGraphProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.children || !data.imports) return;

    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create a map to easily access nodes by their path
    const nodeMap = new Map(data.children.map(node => [node.path, node]));

    // Create links array with source and target as node objects
    const links = data.imports.map(importObj => ({
      source: nodeMap.get(importObj.importingFile),
      target: nodeMap.get(importObj.importedModule),
    })).filter(link => link.source && link.target);

    const simulation = d3.forceSimulation(data.children)
      .force('link', d3.forceLink(links).id((d: any) => d.path).strength(0.1)) 
      .force('charge', d3.forceManyBody().strength(-200)) // Adjust repulsion
      .force('center', d3.forceCenter(width / 2, height / 2));

    const linkElements = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', 1); // Start with a thinner line

    const nodeElements = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(data.children)
      .enter().append('circle')
      .attr('r', d => Math.log(d.size + 10) + 5) // Size based on file size
      .attr('fill', d => d === selectedNode ? 'orange' : '#69b3a2')
      .on('click', (event, d) => { 
        setSelectedNode(d); 
      })
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    nodeElements.append('title')
      .text(d => `${d.name} (${d.size} bytes)`);

    simulation.on('tick', () => {
      linkElements
        .attr('x1', d => d.source.x || 0)
        .attr('y1', d => d.source.y || 0)
        .attr('x2', d => d.target.x || 0)
        .attr('y2', d => d.target.y || 0);

      nodeElements
        .attr('cx', d => d.x || 0)
        .attr('cy', d => d.y || 0);
    });

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup: Stop the simulation on unmount to prevent memory leaks
    return () => simulation.stop(); 

  }, [data, selectedNode]); 

  return (
    <svg ref={svgRef}></svg>
  );
};

export default ForceGraph;