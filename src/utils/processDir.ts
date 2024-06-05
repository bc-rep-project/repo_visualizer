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


import fs from "fs";
import * as nodePath from "path";
import { shouldExcludePath } from "./should-exclude-path";
import { FileType } from "./types";
import uniqueId from "lodash/uniqueId"; // Import uniqueId

export const processDir = async (
  rootPath = "",
  excludedPaths: string[] = [],
  excludedGlobs: string[] = []
): Promise<FileType | undefined> => {
  const foldersToIgnore = [".git", ...excludedPaths];
  const fullPathFoldersToIgnore = new Set(
    foldersToIgnore.map((d) => nodePath.join(rootPath, d))
  );

  const getFileStats = async (path = ""): Promise<FileType> => {
    const stats = fs.statSync(`./${path}`);
    const name = nodePath.basename(path); // Use nodePath.basename for consistency
    const size = stats.size;
    const relativePath = path.slice(rootPath.length + 1);
    return {
      name,
      path: relativePath,
      size,
      nodeId: uniqueId("node-")  // Generate unique ID for the file
    };
  };

  const addItemToTree = async (
    path = "",
    isFolder = true
  ): Promise<FileType | undefined> => {
    try {
      console.log("Looking in ", `./${path}`);

      if (isFolder) {
        const filesOrFolders = fs.readdirSync(`./${path}`);
        const children: FileType[] = []; // Use FileType[]

        for (const fileOrFolder of filesOrFolders) {
          const fullPath = nodePath.join(path, fileOrFolder);
          if (
            shouldExcludePath(
              fullPath,
              fullPathFoldersToIgnore,
              excludedGlobs
            )
          ) {
            continue;
          }

          const info = fs.statSync(`./${fullPath}`);
          const stats = await addItemToTree(
            fullPath,
            info.isDirectory()
          );
          if (stats) children.push(stats);
        }

        const stats = await getFileStats(path);
        return { ...stats, children };
      }

      if (
        shouldExcludePath(path, fullPathFoldersToIgnore, excludedGlobs)
      ) {
        return undefined; // Return undefined if excluded
      }

      const stats = await getFileStats(path);
      return stats;
    } catch (e) {
      console.error("Issue trying to read file", path, e);
      return undefined; // Return undefined in case of error
    }
  };

  const tree = await addItemToTree(rootPath);
  return tree;
};