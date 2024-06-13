// // src/app/app.component.ts

// import { Component, OnInit } from '@angular/core';
// import { processDir } from './components/process-dir';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent implements OnInit {
//   data: any;

//   ngOnInit() {
//     const rootPath = './my-repository';
//     const excludedPaths = ['node_modules'];
//     const excludedGlobs = ['*.log'];
//     this.data = processDir(rootPath, excludedPaths, excludedGlobs);
//   }
// }

// src/app/app.component.ts

// src/app/app.component.ts

import { Component, OnInit } from '@angular/core';
import { GithubApiService } from './services/github-api.service';
import { processDirectoryData } from './components/process-dir';
import * as d3 from 'd3';

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

  constructor(private githubApiService: GithubApiService) { }

  ngOnInit() {
  }

  fetchRepositoryData() {
    this.githubApiService.getRepositoryFiles(this.owner, this.repo).then((files) => {
      this.data = files;
      console.log("Raw Data from GitHub:", this.data); // Check raw data structure

      const [root, importLinks] = processDirectoryData(this.data);

      console.log("Processed Root Node:", root);  // Log the processed tree structure
      console.log("Import Links:", importLinks); // Log the generated import links

      this.visualizeDirectoryData();
    });
  }

  visualizeDirectoryData() {
    const [root, importLinks] = processDirectoryData(this.data);
    const d3Root = d3.hierarchy(root);

    // Create a D3.js selection for the svg element
    const svg = d3.select("#tree-container")
      .append("svg")
      .attr("width", 800)
      .attr("height", 500);

    // Create a D3.js selection for the g element
    const g = svg.append("g")
      .attr("transform", "translate(400,250)");

    // Create a D3.js tree layout
    const tree = d3.tree().size([360, 200]).separation((a, b) => a.parent === b.parent ? 1 : 2);
    const rootNode = tree(d3Root as unknown as d3.HierarchyNode<unknown>);

    // Create the nodes
    const node = g.selectAll(".node")
      .data(rootNode.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `rotate(${(d.x * 180 / Math.PI) - 90}) translate(${d.y}, 0)`);

    node.append("circle")
      .attr("r", 2.5);

    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", (d: any) => d.x < Math.PI === !d.children ? 6 : -6)
      .attr("text-anchor", (d: any) => d.x < Math.PI === !d.children ? "start" : "end")
      .attr("transform", (d: any) => d.x >= Math.PI ? "rotate(180)" : null)
      .text((d: any) => d.data.name);

    // Create the import links
    const link = g.selectAll(".import-link")
      .data(importLinks)
      .enter().append("path")
      .attr("class", "import-link")
      .style("stroke", "blue") // Customize the color of import links
      .attr("d", (d: any) => {
        // Calculate the positions based on the source and target file nodes
        const sourceX = (d.source.y * Math.cos(d.source.x)) * -1;
        const sourceY = (d.source.y * Math.sin(d.source.x)) * -1;
        const targetX = (d.target.y * Math.cos(d.target.x)) * -1;
        const targetY = (d.target.y * Math.sin(d.target.x)) * -1;

        return `M${sourceX},${sourceY} C${sourceX + sourceX * 10},${sourceY} ${targetX - targetX * 10},${targetY} ${targetX},${targetY}`;
      });

    // Create the links
    const radialLink = g.selectAll(".link")
      .data(rootNode.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkRadial().angle((d: any) => d.x).radius((d: any) => d.y));
  }
}