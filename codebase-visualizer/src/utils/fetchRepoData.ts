import axios from 'axios';
import { TreeNode } from './types';

export const fetchRepoData = async (owner: string, repo: string, repoPath: string = ''): Promise<TreeNode> => {
  const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`);
  const data = response.data;

  const node: TreeNode = {
    name: repoPath || repo,
    path: repoPath,
    size: 0,
    type: 'directory',
    children: [] as TreeNode[] | [], // Modified type definition
  };

  for (const item of data) {
    if (item.type === 'file') {
      node.children!.push({ // Non-null assertion operator added
        name: item.name,
        path: item.path,
        size: item.size,
        type: 'file',
      });
    } else if (item.type === 'dir') {
      const childNode = await fetchRepoData(owner, repo, item.path);
      node.children!.push(childNode); // Non-null assertion operator added
      node.size += childNode.size;
    }
  }

  return node;
};