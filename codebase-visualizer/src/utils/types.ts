export interface TreeNode {
    name: string;
    path: string;
    size: number;
    type: 'file' | 'directory';
    children?: TreeNode[];
    imports?: { importedModule: string; importingFile: string }[];
  }
  