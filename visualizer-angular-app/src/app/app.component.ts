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
  data: any[] = [];

  constructor(private githubApiService: GithubApiService) { }

  ngOnInit() {
    this.githubApiService.getRepositoryFiles('OWNER', 'REPO').then((files) => {
      this.data = files;
      this.visualizeDirectoryData();
    });
  }

  visualizeDirectoryData() {
    const root = d3.hierarchy(processDirectoryData(this.data));

    // Create a D3.js tree layout
    const tree = d3.tree().size([500, 800]);
    const rootNode = tree(root as unknown as d3.HierarchyNode<unknown>);

    // Create a D3.js selection for the svg element
    const svg = d3.select("#tree-container")
      .append("svg")
      .attr("width", 800)
      .attr("height", 500);

    // Create a D3.js selection for the g element
    const g = svg.append("g");

    // Create the nodes
    const node = g.selectAll(".node")
      .data(rootNode.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`);

    node.append("circle")
      .attr("r", 2.5);

    node.append("text")
      .attr("dy", 3)
      .attr("x", (d: any) => d.children ? -8 : 8)
      .style("text-anchor", (d: any) => d.children ? "end" : "start")
      .text((d: any) => d.data.name);

    // Create the links
    const link = g.selectAll(".link")
      .data(rootNode.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", (d: any) => {
        return `M${d.source.y},${d.source.x} C${d.source.y + d.source.depth * 10},${d.source.x} ${d.target.y - d.target.depth * 10},${d.target.x} ${d.target.y},${d.target.x}`;
      });
  }
}