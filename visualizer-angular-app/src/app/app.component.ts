// src/app/app.component.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { GithubApiService } from './services/github-api.service';
import { CodeVisualizerComponent } from './components/code-visualizer/code-visualizer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'visualizer-angular-app';
  owner: string = '';
  repo: string = '';
  data: any[] = [];

  @ViewChild(CodeVisualizerComponent) codeVisualizer!: CodeVisualizerComponent;

  constructor(private githubApiService: GithubApiService) { }

  ngOnInit() {
  }

  fetchRepositoryData() {
    this.githubApiService.getRepositoryFiles(this.owner, this.repo).then((files) => {
      this.data = files;
      console.log("Raw Data from GitHub:", this.data); // Check raw data structure

      this.updateCodeVisualizer(this.data);
    });
  }

  updateCodeVisualizer(data: any[]): void {
    // Fetch the data and pass it to the CodeVisualizerComponent
    this.codeVisualizer.updateVisualization(data);
  }
}



// src/app/app.component.ts

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

//       const [root, importLinks] = processDirectoryData(this.data);

//       console.log("Processed Root Node:", root);  // Log the processed tree structure
//       console.log("Import Links:", importLinks); // Log the generated import links

//       this.visualizeDirectoryData();
//     });
//   }

//   visualizeDirectoryData() {
//     const [root, importLinks] = processDirectoryData(this.data);
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