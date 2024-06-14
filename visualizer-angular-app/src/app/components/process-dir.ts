
// src/app/components/process-dir.ts

import * as d3 from 'd3-hierarchy';
import { extractImports } from './extract-imports';

interface DirectoryNode { name: string; children: (DirectoryNode | FileNode)[]; }

interface ImportObject { moduleName: string; modulePath: string; }

interface FileNode { name: string; imports: ImportObject[]; type: string; x: number; y: number; }

interface D3Node extends d3.HierarchyNode<DirectoryNode | FileNode> { x: number; y: number; }

export function processDirectoryData(data: any[]): { root: D3Node, importLinks: { source: D3Node, target: D3Node }[] } {
  const root: DirectoryNode = { name: '', children: [] };
  const nodesMap: { [key: string]: D3Node } = {};
  const importLinks: { source: D3Node, target: D3Node }[] = [];

  // Helper function to create or get a node
  const createOrGetNode = (name: string, parent?: D3Node, type?: string, imports?: ImportObject[]): D3Node => {
    const path = parent ? `${parent.data.name}/${name}` : name;
    if (nodesMap[path]) {
      return nodesMap[path];
    }
    const newNode: D3Node = {
      data: {
        name,
        children: type === 'dir' ? [] : undefined,
        imports: imports || [],
        type: type || 'file',
        x: 0,
        y: 0
      },
      children: [],
      depth: parent ? parent.depth + 1 : 0,
      parent,
    } as D3Node;

    nodesMap[path] = newNode;
    if (parent) {
      parent.children.push(newNode);
    }
    return newNode;
  };

  data.forEach((file) => {
    const fileParts = file.path.split('/');
    let currentNode = createOrGetNode('', undefined, 'dir'); // Start at root

    // Build the directory structure
    for (let i = 0; i < fileParts.length - 1; i++) {
      currentNode = createOrGetNode(fileParts[i], currentNode, 'dir');
    }

    // Add the file node
    const fileName = fileParts[fileParts.length - 1];
    const fileExt = fileName.split('.').pop() || 'file'; // Default to 'file'
    const fileNode = createOrGetNode(fileName, currentNode, fileExt, file.content ? extractImports(file.content) : []);

    // Create import links
    fileNode.data.imports.forEach(imp => {
      const targetNode = nodesMap[imp.modulePath];
      if (targetNode) {
        importLinks.push({ source: fileNode, target: targetNode });
      }
    });
  });

  const d3Root = d3.hierarchy(root); // Create D3 hierarchy
  const treeLayout = d3.tree<DirectoryNode | FileNode>().size([2 * Math.PI, 500]); // Radial layout
  treeLayout(d3Root); // Calculate positions

  // Assign x, y coordinates for radial layout
  d3Root.descendants().forEach((node: D3Node) => {
    node.x = node.x; // Angle
    node.y = node.y; // Radius
  });

  return { root: d3Root as D3Node, importLinks };
}

// import { extractImports } from './extract-imports';

// interface DirectoryNode {
//   name: string;
//   children: (DirectoryNode | FileNode)[];
// }

// interface ImportObject {
//   moduleName: string;
//   modulePath: string;
// }

// interface FileNode {
//   name: string;
//   imports: ImportObject[];
//   type: string;
//   x: number;
//   y: number;
// }

// interface Dependencies {
//   [key: string]: string[];
// }

// export function processDirectoryData(data: any[]): { root: DirectoryNode, importLinks: { source: FileNode, target: FileNode }[], dependencies: Dependencies } {
//   const root: DirectoryNode = { name: '', children: [] };
//   const childrenMap: { [key: string]: DirectoryNode | FileNode } = { [root.name]: root };
//   const importLinks: { source: FileNode, target: FileNode }[] = [];
//   const dependencies: Dependencies = {};

//   data.forEach((file) => {
//     const fileParts = file.path.split('/');
//     const fileName = fileParts[fileParts.length - 1];
//     const fileExt = fileName.split('.').pop() || '';

//     let parentNode: DirectoryNode = root;
//     fileParts.forEach((part: string) => {
//       if (!childrenMap[part]) {
//         const childNode: DirectoryNode = { name: part, children: [] };
//         childrenMap[part] = childNode;
//         parentNode.children.push(childNode);
//       }
//       parentNode = childrenMap[part] as DirectoryNode;
//     });

//     if (file.content) {
//       const imports = extractImports(file.content); // The function returns an array of { moduleName: string, modulePath: string }
//       const fileNode: FileNode = {
//         name: fileName,
//         imports,
//         type: fileExt,
//         x: 0,
//         y: 0,
//       };
//       parentNode.children.push(fileNode);

//       imports.forEach((importName) => {
//         const importNode = findImportNode(importName.moduleName, root);
//         if (importNode) {
//           console.log("Generated Import Link:", { source: fileNode, target: importNode });
//           importLinks.push({ source: fileNode, target: importNode });
//         }
//         if (findImportNode(importName.moduleName, root)) {
//           dependencies[importNode?.name || ''] = dependencies[importNode?.name || ''] || [];
//           dependencies[importNode?.name || ''].push(fileNode.name);
//         }
//       });

//       fileNode.x = parentNode.children.indexOf(fileNode);
//       fileNode.y = parentNode.children.length - 1;
//     }
//   });

//   console.log("Final Import Links:", importLinks);
//   console.log("Final Dependencies:", dependencies);
//   return { root, importLinks, dependencies };
// }

// function findImportNode(importName: string, node: DirectoryNode): FileNode | undefined {
//   if ('children' in node) {
//     for (const child of node.children) {
//       if ('children' in child) {
//         const found = findImportNode(importName, child as DirectoryNode);
//         if (found) {
//           return found;
//         }
//       } else if ((child as FileNode).name === importName) {
//         return child as FileNode;
//       }
//     }
//   }

//   return undefined;
// }