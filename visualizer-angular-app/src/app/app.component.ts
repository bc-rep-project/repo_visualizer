// src/app/app.component.ts

import { Component, OnInit } from '@angular/core';
import { processDir } from './components/process-dir';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  data: any;

  ngOnInit() {
    const rootPath = './my-repository';
    const excludedPaths = ['node_modules'];
    const excludedGlobs = ['*.log'];
    this.data = processDir(rootPath, excludedPaths, excludedGlobs);
  }
}
