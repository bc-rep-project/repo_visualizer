// // src/app/app.component.ts

// import * as d3 from 'd3-hierarchy';
// import { extractImports } from './extract-imports';

// interface DirectoryNode { name: string; children: (DirectoryNode | FileNode)[]; }

// interface ImportObject { moduleName: string; modulePath: string; }

// interface FileNode { name: string; imports: ImportObject[]; type: string; x: number; y: number; }

// interface D3Node extends d3.HierarchyNode<DirectoryNode | FileNode> { x: number; y: number; }

// export function processDirectoryData(data: any[]): { root: D3Node, importLinks: { source: D3Node, target: D3Node }[] } {
//   const root: DirectoryNode = { name: '', children: [] };
//   const nodesMap: { [key: string]: D3Node } = {};
//   const importLinks: { source: D3Node, target: D3Node }[] = [];

//   // Helper function to create or get a node
//   const createOrGetNode = (name: string, parent?: D3Node, type?: string, imports?: ImportObject[]): D3Node => {
//     const path = parent ? `${parent.data.name}/${name}` : name;
//     if (nodesMap[path]) {
//       return nodesMap[path];
//     }
//     const newNode: D3Node = {
//       data: {
//         name,
//         children: type === 'dir' ? [] : undefined,
//         imports: imports || [],
//         type: type || 'file',
//         x: 0,
//         y: 0
//       },
//       children: [],
//       depth: parent ? parent.depth + 1 : 0,
//       parent,
//     } as D3Node;

//     nodesMap[path] = newNode;
//     if (parent) {
//       parent.children.push(newNode);
//     }
//     return newNode;
//   };

//   data.forEach((file) => {
//     const fileParts = file.path.split('/');
//     let currentNode = createOrGetNode('', undefined, 'dir'); // Start at root

//     // Build the directory structure
//     for (let i = 0; i < fileParts.length - 1; i++) {
//       currentNode = createOrGetNode(fileParts[i], currentNode, 'dir');
//     }

//     // Add the file node
//     const fileName = fileParts[fileParts.length - 1];
//     const fileExt = fileName.split('.').pop() || 'file'; // Default to 'file'
//     const fileNode = createOrGetNode(fileName, currentNode, fileExt, file.content ? extractImports(file.content) : []);

//     // Create import links
//     fileNode.data.imports.forEach(imp => {
//       const targetNode = nodesMap[imp.modulePath];
//       if (targetNode) {
//         importLinks.push({ source: fileNode, target: targetNode });
//       }
//     });
//   });

//   const d3Root = d3.hierarchy(root); // Create D3 hierarchy
//   const treeLayout = d3.tree<DirectoryNode | FileNode>().size([2 * Math.PI, 500]); // Radial layout
//   treeLayout(d3Root); // Calculate positions

//   // Assign x, y coordinates for radial layout
//   d3Root.descendants().forEach((node: D3Node) => {
//     node.x = node.x; // Angle
//     node.y = node.y; // Radius
//   });

//   return { root: d3Root as D3Node, importLinks };
// }

// // Here is your updated component code:
// import { Component, OnInit } from '@angular/core';
// import { GithubApiService } from './services/github-api.service';
// import * as d3 from 'd3';
// import { processDirectoryData } from './components/process-dir';

// @Component({
//   selector: 'app-code-visualizer',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class CodeVisualizerComponent implements OnInit {
//   title = 'Code Visualizer';
//   owner = '';
//   repo = '';
//   data: any[] = [];
//   svg: any;
//   simulation: any;
//   nodes: any[] = [];
//   links: any[] = [];
//   processedData: any;

//   constructor(private githubApiService: GithubApiService) {}

//   ngOnInit(): void {
//     this.svg = d3.select('svg');
//     this.simulation = d3.forceSimulation();
//   }

//   fetchRepositoryData(): void {
//     this.githubApiService.getRepositoryFiles(this.owner, this.repo).then(data => {
//       this.data = data;
//       this.updateVisualization(this.data);
//     });
//   }

//   updateVisualization(data: any[]): void {
//     // Process the data using the processDirectoryData function
//     this.processedData = processDirectoryData(data);

//     // Update the nodes and links arrays
//     this.updateNodesAndLinks(this.processedData.root, this.processedData.importLinks);

//     // Restart the force simulation with the new nodes and links
//     this.restartSimulation();
//   }

//   private restartSimulation(): void {
//     this.simulation
//       .nodes(this.processedData.root.descendants())
//       .force('charge', d3.forceManyBody().strength(-100))
//       .force('center', d3.forceCenter(this.svg.attr('width') / 2, this.svg.attr('height') / 2))
//       .force('link', d3.forceLink(this.processedData.importLinks).id((d: any) => d.id));

//     // Create the links
//     const link = this.svg.select('g.links').selectAll('line')
//       .data(this.processedData.importLinks, (d: any) => `${d.source.id}-${d.target.id}`);

//     const linkEnter = link.enter()
//       .append('line')
//       .style('stroke', '#999')
//       .style('stroke-opacity', 0.6)
//       .style('stroke-width', 1);

//     link.merge(linkEnter);

//     link.exit().remove();

//     // Create the nodes
//     const node = this.svg.select('g.nodes').selectAll('circle')
//       .data(this.processedData.root.descendants(), (d: any) => d.id);

//     const nodeEnter = node.enter()
//       .append('circle')
//       .attr('r', 5)
//       .style('fill', (d: any) => this.colorByFileType(d.data.type))
//       .on('mouseover', (event: any, d: any) => {
//         // Highlight the selected node and its dependencies
//         this.highlightDependencies(d);
//       })
//       .on('mouseout', (event: any, d: any) => {
//         // Reset the node and its dependencies highlight
//         this.resetHighlight(d);
//       })
//       .call(d3.drag()
//         .on('start', (event: any, d: any) => {
//           if (!event.active) this.simulation.alphaTarget(0.3).restart();
//           d.fx = d.x;
//           d.fy = d.y;
//         })
//         .on('drag', (event: any, d: any) => {
//           d.fx = event.x;
//           d.fy = event.y;
//         })
//         .on('end', (event: any, d: any) => {
//           if (!event.active) this.simulation.alphaTarget(0);
//           d.fx = null;
//           d.fy = null;
//         }));

//     node.merge(nodeEnter);

//     node.exit().remove();

//     // Add labels to the nodes
//     node.append('title').text((d: any) => d.data.name);

//     // Update the simulation
//     this.simulation.on('tick', () => {
//       link.merge(linkEnter)
//         .attr('x1', (d: any) => d.source.x)
//         .attr('y1', (d: any) => d.source.y)
//         .attr('x2', (d: any) => d.target.x)
//         .attr('y2', (d: any) => d.target.y);

//       node.merge(nodeEnter)
//         .attr('cx', (d: any) => d.x)
//         .attr('cy', (d: any) => d.y);
//     });
//   }

//   private updateNodesAndLinks(root: D3Node, importLinks: { source: D3Node, target: D3Node }[]): void {
//     // Update the nodes and links arrays
//     this.nodes = root.descendants();
//     this.links = importLinks;
//   }

//   private colorByFileType(type: string): string {
//     // Define the color mapping for different file types
//     const colorMap: { [key: string]: string } = {
//       'ts': '#f06',  // TypeScript files
//       'js': '#ff0',  // JavaScript files
//       'css': '#0af', // CSS files
//       'html': '#00f' // HTML files
//       // Add more file types and colors as needed
//     };

//     return colorMap[type] || '#ccc';  // Default color for unknown file types
//   }

//   private highlightDependencies(node: any): void {
//     // Highlight the selected node and its dependencies
//     const dependencies = this.processedData.importLinks.filter((link: { source: D3Node, target: D3Node }) => link.source === node);
//     this.highlightNodes(dependencies.map(link => link.target));
//   }

//   private resetHighlight(node: any): void {
//     // Reset the node and its dependencies highlight
//     const dependencies = this.processedData.importLinks.filter((link: { source: D3Node, target: D3Node }) => link.source === node);
//     this.resetNodes(dependencies.map(link => link.target));
//   }

//   private highlightNodes(nodes: D3Node[]): void {
//     // Highlight the specified nodes
//     this.svg.selectAll('circle')
//       .filter((d: any) => nodes.includes(d))
//       .style('fill', 'red');
//   }

//   private resetNodes(nodes: D3Node[]): void {
//     // Reset the specified nodes to their original color
//     this.svg.selectAll('circle')
//       .filter((d: any) => nodes.includes(d))
//       .style('fill', (d: any) => this.colorByFileType(d.data.type));
//   }
// }




import { Component, OnInit } from '@angular/core';
import { GithubApiService } from './services/github-api.service';
import { processDirectoryData } from './components/process-dir';
import { extractImports } from './components/extract-imports';
import * as d3 from 'd3';

@Component({
  selector: 'app-code-visualizer',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class CodeVisualizerComponent implements OnInit {
  title = 'Code Visualizer';
  owner = '';
  repo = '';
  data: any[] = [];
  svg: any;
  simulation: any;
  nodes: any[] = [];
  links: any[] = [];
  processedData: any;

  constructor(private githubApiService: GithubApiService) {}

  ngOnInit(): void {
    this.svg = d3.select('svg');
    this.simulation = d3.forceSimulation();
  }

  fetchRepositoryData(): void {
    this.githubApiService.getRepositoryFiles(this.owner, this.repo).then(data => {
      this.data = data;
      this.updateVisualization(this.data);
    });
  }

  updateVisualization(data: any[]): void {
    // Process the data using the processDirectoryData function
    this.processedData = processDirectoryData(data);

    // Update the nodes and links arrays
    this.updateNodesAndLinks(this.processedData);

    // Restart the force simulation with the new nodes and links
    this.restartSimulation();
  }

  private restartSimulation(): void {
    this.simulation
      .nodes(this.processedData.nodes)
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(this.svg.attr('width') / 2, this.svg.attr('height') / 2))
      .force('link', d3.forceLink(this.processedData.links).id((d: any) => d.id));

    // Create the links
    const link = this.svg.select('g.links').selectAll('line')
      .data(this.processedData.links, (d: any) => `${d.source.id}-${d.target.id}`);

    const linkEnter = link.enter()
      .append('line')
      .style('stroke', '#999')
      .style('stroke-opacity', 0.6)
      .style('stroke-width', 1);

    link.merge(linkEnter);

    link.exit().remove();

    // Create the nodes
    const node = this.svg.select('g.nodes').selectAll('circle')
      .data(this.processedData.nodes, (d: any) => d.id);

    const nodeEnter = node.enter()
      .append('circle')
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
          if (!event.active) this.simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event: any, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event: any, d: any) => {
          if (!event.active) this.simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.merge(nodeEnter);

    node.exit().remove();

    // Add labels to the nodes
    node.append('title').text((d: any) => d.name);

    // Update the simulation
    this.simulation.on('tick', () => {
      link.merge(linkEnter)
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.merge(nodeEnter)
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



// // src/app/app.component.ts

// import { Component, OnInit } from '@angular/core';
// import { GithubApiService } from './services/github-api.service';
// import { processDirectoryData } from './components/process-dir';
// import * as d3 from 'd3';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent implements OnInit {
//   title = 'visualizer-angular-app';
//   owner: string = '';
//   repo: string = '';
//   data: any[] = [];

//   constructor(private githubApiService: GithubApiService) { }

//   ngOnInit() {
//   }

//   fetchRepositoryData() {
//     this.githubApiService.getRepositoryFiles(this.owner, this.repo).then((files) => {
//       this.data = files;
//       console.log("Raw Data from GitHub:", this.data); // Check raw data structure

//       const result = processDirectoryData(this.data);
//       const root = result.root;
//       const importLinks = result.importLinks;

//       console.log("Processed Root Node:", root);  // Log the processed tree structure
//       console.log("Import Links:", importLinks); // Log the generated import links

//       this.visualizeDirectoryData(root, importLinks);
//     });
//   }

//   visualizeDirectoryData(root: any, importLinks: any) {
//     const d3Root = d3.hierarchy(root);

//     // Create a D3.js selection for the svg element
//     const svg = d3.select("#tree-container")
//       .append("svg")
//       .attr("width", 800)
//       .attr("height", 500);

//     // Create a D3.js selection for the g element
//     const g = svg.append("g")
//       .attr("transform", "translate(400, 300)");

//     // Create the import links
//     const radialLink = d3.linkRadial()
//     .source((d: any) => {
//       const [x0, y0] = d.source;
//       return [y0 * Math.cos(x0), y0 * Math.sin(x0)];
//     })
//     .target((d: any) => {
//       const [x1, y1] = d.target;
//       return [y1 * Math.cos(x1), y1 * Math.sin(x1)];
//     })
//     .radius(() => 300)
//     .angle((d: any) => d.x);
  
//   // Create the import links
//   const importLink = g.selectAll(".import-link")
//     .data(importLinks)
//     .enter().append("path")
//     .attr("class", "import-link")
//     .style("stroke", "blue") // Customize the color of import links
//     .attr("d", (d: any) => {
//       return radialLink({ source: d.source, target: d.target });
//     });

//     // Create a D3.js tree layout
//     const tree = d3.tree().size([500, 800]);
//     const rootNode = tree(d3Root as unknown as d3.HierarchyNode<unknown>);

//     // Create the nodes
//     const node = g.selectAll(".node")
//       .data(rootNode.descendants())
//       .enter().append("g")
//       .attr("class", "node")
//       .attr("transform", (d: any) => `translate(${d.y * Math.cos(d.x)},${d.y * Math.sin(d.x)})`);

//     node.append("circle")
//       .attr("r", 2.5);

//     node.append("text")
//       .attr("dy", 3)
//       .attr("x", (d: any) => d.children ? -8 : 8)
//       .style("text-anchor", (d: any) => d.children ? "end" : "start")
//       .text((d: any) => d.data.name);

//     // Create the links
//     const link = g.selectAll(".link")
//       .data(rootNode.links())
//       .enter().append("path")
//       .attr("class", "link")
//       .attr("d", (d: any) => {
//         const xArrow = (d.target.x * Math.PI) / 180;
//         const yArrow = (d.target.y * Math.PI) / 180;
//         const xSource = d.source.y * Math.cos(d.source.x);
//         const ySource = d.source.y * Math.sin(d.source.x);
//         const xTarget = d.target.y * Math.cos(d.target.x);
//         const yTarget = d.target.y * Math.sin(d.target.x);
//         return `M${xSource},${ySource} L${xTarget},${yTarget}`;
//       });
//   }
// }