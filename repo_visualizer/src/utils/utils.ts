// export const truncateString = (
//   string: string = "",
//   length: number = 20,
// ): string => {
//   return string.length > length + 3
//     ? string.substring(0, length) + "..."
//     : string;
// };

// export const keepBetween = (min: number, max: number, value: number) => {
//   return Math.max(min, Math.min(max, value));
// };

// export const getPositionFromAngleAndDistance = (
//   angle: number,
//   distance: number,
// ): [number, number] => {
//   const radians = angle / 180 * Math.PI;
//   return [
//     Math.cos(radians) * distance,
//     Math.sin(radians) * distance,
//   ];
// };

// export const getAngleFromPosition = (x: number, y: number): number => {
//   return Math.atan2(y, x) * 180 / Math.PI;
// };

// export const keepCircleInsideCircle = (
//   parentR: number,
//   parentPosition: [number, number],
//   childR: number,
//   childPosition: [number, number],
//   isParent: boolean = false,
// ): [number, number] => {
//   const distance = Math.sqrt(
//     Math.pow(parentPosition[0] - childPosition[0], 2) +
//       Math.pow(parentPosition[1] - childPosition[1], 2),
//   );
//   const angle = getAngleFromPosition(
//     childPosition[0] - parentPosition[0],
//     childPosition[1] - parentPosition[1],
//   );
//   // leave space for labels
//   const padding = Math.min(
//     angle < -20 && angle > -100 && isParent ? 13 : 3,
//     parentR * 0.2,
//   );
//   if (distance > (parentR - childR - padding)) {
//     const diff = getPositionFromAngleAndDistance(
//       angle,
//       parentR - childR - padding,
//     );
//     return [
//       parentPosition[0] + diff[0],
//       parentPosition[1] + diff[1],
//     ];
//   }
//   return childPosition;
// };


import { TreeNode } from './types';

export const extractDependencies = (node: TreeNode): { source: string; target: string }[] => {
  const dependencies: { source: string; target: string }[] = [];

  const traverse = (currentNode: TreeNode) => {
    if (currentNode.imports) {
      currentNode.imports.forEach(imported => {
        dependencies.push({
          source: currentNode.path, // Use currentNode for clarity
          target: imported.importedModule,
        });
      });
    }
    currentNode.children?.forEach(traverse); 
  };

  traverse(node);
  return dependencies;
};

// Additional helpful utility functions for graph processing:

export const calculateNodeSize = (node: TreeNode, baseSize: number = 10): number => {
  // Adjust the formula for desired scaling based on file size
  return Math.log(node.size + 1) * baseSize; 
};

export const findNodeByPath = (rootNode: TreeNode, targetPath: string): TreeNode | null => {
  let foundNode: TreeNode | null = null;

  const traverse = (currentNode: TreeNode) => {
    if (currentNode.path === targetPath) {
      foundNode = currentNode;
      return; 
    }
    currentNode.children?.forEach(traverse);
  };

  traverse(rootNode);
  return foundNode;
};

export const getDependencyPath = (
  rootNode: TreeNode, 
  startPath: string, 
  endPath: string
): { source: string; target: string }[] => {
  const path: { source: string; target: string }[] = [];
  let found = false;

  const traverse = (currentNode: TreeNode, visited: Set<string> = new Set()) => {
    visited.add(currentNode.path); 

    if (currentNode.path === endPath && visited.has(startPath)) {
      found = true;
      return; 
    }

    if (currentNode.imports) {
      for (const imported of currentNode.imports) {
        const targetNode = findNodeByPath(rootNode, imported.importedModule);
        if (targetNode && !visited.has(targetNode.path)) {
          path.push({ source: currentNode.path, target: targetNode.path });
          traverse(targetNode, new Set(visited)); 
          if (found) return; 
          path.pop(); 
        }
      }
    }

    currentNode.children?.forEach(child => {
      if (!visited.has(child.path)) {
        path.push({ source: currentNode.path, target: child.path });
        traverse(child, new Set(visited));
        if (found) return;
        path.pop(); 
      }
    });
  };

  traverse(findNodeByPath(rootNode, startPath) as TreeNode); 
  return path;
};