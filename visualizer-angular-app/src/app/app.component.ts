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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  data: any[] = [];

  constructor(private githubApiService: GithubApiService) { }

  ngOnInit() {
    this.githubApiService.getRepositoryFiles('OWNER', 'REPO').then((files) => {
      this.data = files;
      this.visualizeDirectoryData();
    });
  }

  visualizeDirectoryData() {
    const root = processDirectoryData(this.data);
  
    // Create a D3.js tree layout
    const tree = d3.tree().size([height, width]);
    const root = tree(processDirectoryData(this.data));
  
    // Create a D3.js selection for the svg element
    const svg = d3.select("#tree-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    // Create a D3.js selection for the g element
    const g = svg.append("g");
  
    // Create the nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`);
  
    node.append("circle")
      .attr("r", 2.5);
  
    node.append("text")
      .attr("dy", 3)
      .attr("x", (d) => d.children ? -8 : 8)
      .style("text-anchor", (d) => d.children ? "end" : "start")
      .text((d) => d.data.name);
  
    // Create the links
    const link = g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x((d) => d.y)
        .y((d) => d.x));
  }
}
