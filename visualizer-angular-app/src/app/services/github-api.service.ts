// src/app/services/github-api.service.ts

// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import axios from 'axios';
// import { environment } from '../environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class GithubApiService {
//   private get token(): string {
//     return process.env['GITHUB_PAT'] || '';
//   }

//   constructor(private http: HttpClient) { }

//   getRepositoryFiles(owner: string, repo: string, path?: string): Promise<any[]> {
//     const url = `https://api.github.com/repos/${owner}/${repo}/contents${path ? `/${path}` : ''}`;
//     return axios.get(url, { headers: { Authorization: `token ${this.token}` } })
//       .then(response => response.data.map((file: any) => ({
//         name: file.name,
//         path: file.path,
//         content: file.type === 'file' ? this.getFileContent(owner, repo, file.path) : null
//       })));
//   }

//   getFileContent(owner: string, repo: string, filePath: string): Promise<string> {
//     const url = `https://api.github.com/repos/${owner}/${repo}/contents${filePath}`;
//     return axios.get(url, { headers: { Authorization: `token ${this.token}` } })
//       .then(response => atob(response.data.content));
//   }
// }


import { Injectable } from '@angular/core';

type File = {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;
};

@Injectable({
  providedIn: 'root'
})
export class GithubApiService {
  private get token(): string {
    return process.env['GITHUB_PAT'] || '';
  }

  async getRepositoryFiles(owner: string, repo: string, path?: string): Promise<any[]> {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents${path ? `/${path}` : ''}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.map((file: File) => ({
      name: file.name,
      path: file.path,
      content: file.type === 'file' ? this.getFileContent(owner, repo, file.path) : null
    }));
  }

  async getFileContent(owner: string, repo: string, filePath: string): Promise<string> {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents${filePath}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return atob(data.content);
  }
}