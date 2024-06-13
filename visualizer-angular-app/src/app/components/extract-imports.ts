// src/app/components/extract-imports.ts


// export function extractImports(content: string): any[] {
//     const importRegex = /import\s+(.+?)\s+from\s+(['"])(.+?)\2/g;
//     const imports: any[] = [];
//     let match: RegExpExecArray | null;
  
//     while ((match = importRegex.exec(content)) !== null) {
//       imports.push({
//         importedModule: match[3], // The imported module
//         importingFile: match[1] // The file doing the importing
//       });
//     }
  
//     return imports;
//   }
import importedModule from 'modulePath';


const extractImports = (content: string): string[] => {
  const importRegex = /import\s+(.+?)\s+from\s+['"](.+?)['"]/g;
  const imports: string[] = [];

  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    const [ , importedModule, modulePath ] = match;
    console.log("Found import statement:", importedModule, "from", modulePath);
    imports.push(importedModule);
  }

  return imports;
};

export { extractImports };