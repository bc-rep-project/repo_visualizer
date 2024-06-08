import axios from 'axios';
import { TreeNode } from './types';

const GITHUB_API_URL = 'https://api.github.com';

export const fetchRepoData = async (
  owner: string,
  repo: string,
  path = '' // Add an optional path parameter for recursive calls
): Promise<TreeNode | null> => {
  try {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`;
    const response = await axios.get(url);
    const data = response.data; 

    const transformedData: TreeNode = {
      name: repo,
      path: path,
      size: data.size || 0, // Assuming the API response has a 'size' property
      children: [], // Initialize children array
      imports: [],   // Initialize imports array
      type: Array.isArray(data) ? 'directory' : 'file', 
    };

    // Recursively fetch and process children if it's a directory
    if (Array.isArray(data)) {
      transformedData.children = (await Promise.all(
        data.map(async (item: any) => { // You might need to adjust this type 
          if (item.type === 'dir') {
            return fetchRepoData(owner, repo, item.path);
          }
          return null; // Skip files for now (or handle them as needed)
        })
      ).then(children => children.filter(child => child !== null))) as TreeNode[];
    }

    return transformedData;

  } catch (error) {
    console.error('Error fetching repository data:', error);
    return null;
  }
};