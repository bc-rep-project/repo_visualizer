import { OnInit } from '@angular/core';
import * as d3 from 'd3';
import { processDirectoryData } from '../process-dir';
import { extractImports } from '../extract-imports';

export class CodeVisualizerComponent implements OnInit {
    private data: any[] = [];
    private svg: any;
    private nodes: any[] = [];
    private links: any[] = [];
    private processedData: any;
  
    constructor() { }
  
    ngOnInit(): void {
    }
  
    updateVisualization(data: any[]): void {
      // Process the data using the processDirectoryData function
      const processedData = processDirectoryData(data);
  
      // Set up the D3.js visualization
      this.initD3(processedData);
  
      // Update the nodes and links based on the processedData
      this.updateNodesAndLinks(processedData);
    }
  
    private initD3(processedData: any): void {
      // Set up the SVG container
      this.svg = d3.select('svg');
  
      // Set up the force simulation
      const simulation = d3.forceSimulation(processedData.nodes)
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter(this.svg.attr('width') / 2, this.svg.attr('height') / 2))
        .force('link', d3.forceLink(processedData.links).id((d: any) => d.id));
  
      // Create the links
      const link = this.svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(processedData.links)
        .enter().append('line')
        .style('stroke', '#999')
        .style('stroke-opacity', 0.6)
        .style('stroke-width', 1);
  
      // Create the nodes
      const node = this.svg.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(processedData.nodes)
        .enter().append('circle')
        .attr('r', 5)
        .style('fill', (d: any) => this.colorByFileType(d.type))
        .on('mouseover', (event: any, d: any) => {
          // Highlight the selected node and its dependencies
          this.highlightDependencies(d);
        })
        .on('mouseout', (event: any, d: any) => {
          // Reset the node and its dependencies highlight
          this.resetHighlight(d);
        })
        .call(d3.drag()
          .on('start', (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event: any, d: any) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }));
  
      // Add labels to the nodes
      node.append('title').text((d: any) => d.name);
  
      // Update the simulation
      simulation.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);
  
        node
          .attr('cx', (d: any) => d.x)
          .attr('cy', (d: any) => d.y);
      });
    }
  
    private updateNodesAndLinks(processedData: any): void {
      // Update the nodes and links arrays
      this.nodes = processedData.nodes;
      this.links = processedData.links;
    }
  
    private colorByFileType(type: string): string {
      // Define the color mapping for different file types
      const colorMap: { [key: string]: string } = {
        'ts': '#f06',  // TypeScript files
        'js': '#ff0',  // JavaScript files
        'css': '#0af', // CSS files
        'html': '#00f' // HTML files
        // Add more file types and colors as needed
      };
  
      return colorMap[type] || '#ccc';  // Default color for unknown file types
    }
  
    private highlightDependencies(node: any): void {
      // Highlight the selected node and its dependencies
      const dependencies = this.processedData.dependencies[node.name];
      this.highlightNodes(dependencies);
    }
  
    private resetHighlight(node: any): void {
      // Reset the node and its dependencies highlight
      const dependencies = this.processedData.dependencies[node.name];
      this.resetNodes(dependencies);
    }
  
    private highlightNodes(nodes: string[]): void {
      // Highlight the specified nodes
      this.svg.selectAll('circle')
        .filter((d: any) => nodes.includes(d.name))
        .style('fill', 'red');
    }
  
    private resetNodes(nodes: string[]): void {
      // Reset the specified nodes to their original color
      this.svg.selectAll('circle')
        .filter((d: any) => nodes.includes(d.name))
        .style('fill', (d: any) => this.colorByFileType(d.type));
    }
  }