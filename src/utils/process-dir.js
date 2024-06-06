// import fs from "fs";
// import * as nodePath from 'path';
// import { shouldExcludePath } from './should-exclude-path';


// export const processDir = async (rootPath = "", excludedPaths = [], excludedGlobs = []) => {
//   const foldersToIgnore = [".git", ...excludedPaths]
//   const fullPathFoldersToIgnore = new Set(foldersToIgnore.map((d) =>
//     nodePath.join(rootPath, d)
//   ));


//   const getFileStats = async (path = "") => {
//     const stats = await fs.statSync(`./${path}`);
//     const name = path.split("/").filter(Boolean).slice(-1)[0];
//     const size = stats.size;
//     const relativePath = path.slice(rootPath.length + 1);
//     return {
//       name,
//       path: relativePath,
//       size,
//     };
//   };
//   const addItemToTree = async (
//     path = "",
//     isFolder = true,
//   ) => {
//     try {
//       console.log("Looking in ", `./${path}`);

//       if (isFolder) {
//         const filesOrFolders = await fs.readdirSync(`./${path}`);
//         const children = [];

//         for (const fileOrFolder of filesOrFolders) {
//           const fullPath = nodePath.join(path, fileOrFolder);
//           if (shouldExcludePath(fullPath, fullPathFoldersToIgnore, excludedGlobs)) {
//             continue;
//           }

//           const info = fs.statSync(`./${fullPath}`);
//           const stats = await addItemToTree(
//             fullPath,
//             info.isDirectory(),
//           );
//           if (stats) children.push(stats);
//         }

//         const stats = await getFileStats(path);
//         return { ...stats, children };
//       }

//       if (shouldExcludePath(path, fullPathFoldersToIgnore, excludedGlobs)) {
//         return null;
//       }
//       const stats = getFileStats(path);
//       return stats;

//     } catch (e) {
//       console.log("Issue trying to read file", path, e);
//       return null;
//     }
//   };

//   const tree = await addItemToTree(rootPath);

//   return tree;
// };


import fs from 'fs';
import path from 'path';
import { isMatch } from 'micromatch';

// Main function to process the directory
export const processDir = (rootPath, excludedPaths = [], excludedGlobs = []) => {
  const pathsToIgnore = new Set(excludedPaths);

  const shouldExcludePath = (p) => {
    if (pathsToIgnore.has(p)) return true;
    return excludedGlobs.some(glob => isMatch(p, glob));
  };

  const getFileStats = (filePath) => {
    const stats = fs.statSync(filePath);
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const imports = extractImports(fileContents);
    return {
      name: path.basename(filePath),
      path: filePath,
      size: stats.size,
      imports,
    };
  };

  const addItemToTree = (dirPath) => {
    if (shouldExcludePath(dirPath)) return null;
    const stats = fs.statSync(dirPath);

    if (stats.isDirectory()) {
      const children = fs.readdirSync(dirPath).map(child => addItemToTree(path.join(dirPath, child)));
      return {
        name: path.basename(dirPath),
        path: dirPath,
        type: 'directory',
        children: children.filter(Boolean), // Remove null entries
      };
    } else if (stats.isFile()) {
      return {
        type: 'file',
        ...getFileStats(dirPath),
      };
    }
  };

  return addItemToTree(rootPath);
};

// Function to extract imports from a file's content
const extractImports = (fileContents) => {
  const imports = [];
  const importRegex = /import\s+(.+?)\s+from\s+['"](.+?)['"]/g;
  let match;
  while ((match = importRegex.exec(fileContents)) !== null) {
    imports.push({
      importedModule: match[2],
      importingFile: match[1],
    });
  }
  return imports;
};