// src/app/components/extract-imports.ts

const extractImports = (content: string): { moduleName: string, modulePath: string }[] => {
  const importRegex = /import\s+(.+?)\s+from\s+['"]([^'"]+)['"]/g;
  const imports: { moduleName: string, modulePath: string }[] = [];

  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    const [ , importedModule, modulePath ] = match;
    console.log("Found import statement:", importedModule, "from", modulePath);
    imports.push({ moduleName: importedModule, modulePath });
  }

  return imports;
};

export { extractImports };


// // src/app/components/extract-imports.ts
// const extractImports = (content: string): string[] => {
//   const importRegex = /import\s+(.+?)\s+from\s+['"](.+?)['"]/g;
//   const imports: string[] = [];

//   let match: RegExpExecArray | null;
//   while ((match = importRegex.exec(content)) !== null) {
//     const [ , importedModule, modulePath ] = match;
//     console.log("Found import statement:", importedModule, "from", modulePath);
//     imports.push(importedModule);
//   }

//   return imports;
// };

// export { extractImports };