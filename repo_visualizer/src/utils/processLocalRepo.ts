import axios from 'axios';
import path from 'path';
import { TreeNode } from '../components/types';

// Function to calculate the size of a file and its imports
const calculateFileSize = async (filePath: string, imports: { importedModule: string; importingFile: string; }[]): Promise<number> => {
  const response = await axios.post('http://localhost:3001/calculate-file-size', { filePath, imports });
  return response.data.size;
};

// Function to calculate the total size of the codebase
const calculateTotalSize = async (node: TreeNode): Promise<number> => {
  let totalSize = 0;
  if (node.type === 'file') {
    totalSize += await calculateFileSize(node.path, []);
  } else if (node.children) {
    for (const child of node.children) {
      totalSize += await calculateTotalSize(child);
    }
  }
  return totalSize;
};

// Function to process a local repository
export const processLocalRepo = async (repoPath: string): Promise<TreeNode | null> => {
  try {
    // 1. Recursively Read Directory Structure
    const readDirectory = async (dirPath: string): Promise<TreeNode[]> => {
      const response = await axios.post('http://localhost:3001/read-directory', { dirPath });
      return response.data;
    };

    // 2. Create Root Node
    const rootNode: TreeNode = {
      name: path.basename(repoPath), // Get the repo name from the path
      path: repoPath,
      size: 0, // You'll need to calculate this recursively
      type: 'directory',
      children: await readDirectory(repoPath),
    };

    // 3. Parse Imports and Calculate Size
    rootNode.size = await calculateTotalSize(rootNode);

    return rootNode;
  } catch (error) {
    console.error('Error processing local repository:', error);
    return null;
  }
};
