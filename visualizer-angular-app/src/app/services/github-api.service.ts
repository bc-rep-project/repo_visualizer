// src/app/services/github-api.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class GithubApiService {
  private token = 'YOUR_GITHUB_PAT';

  constructor(private http: HttpClient) { }

  getRepositoryFiles(owner: string, repo: string, path?: string): Promise<any[]> {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents${path ? `/${path}` : ''}`;
    return axios.get(url, { headers: { Authorization: `token ${this.token}` } })
      .then(response => response.data.map((file: any) => ({
        name: file.name,
        path: file.path,
        content: file.type === 'file' ? this.getFileContent(owner, repo, file.path) : null
      })));
  }

  getFileContent(owner: string, repo: string, filePath: string): Promise<string> {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents${filePath}`;
    return axios.get(url, { headers: { Authorization: `token ${this.token}` } })
      .then(response => atob(response.data.content));
  }
}
