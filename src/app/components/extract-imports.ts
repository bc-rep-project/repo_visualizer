// src/app/components/extract-imports.ts

const extractImports = (content: string): { moduleName: string, modulePath: string }[] => {
  // Regular expression to match Python import statements (e.g., "import module", "from module import something")
  const importRegex = /^(?:from\s+([\w.]+)\s+)?import\s+([\w.,\s*]+)/gm; 
  const imports: { moduleName: string, modulePath: string }[] = [];

  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    let modulePath = match[1]; // Module path (if "from ... import")
    const importedModules = match[2].split(',').map(m => m.trim()); // Imported modules (can be multiple)

    importedModules.forEach(importedModule => {
      // If modulePath is not specified, assume the importedModule is the module itself
      if (!modulePath) { 
        modulePath = importedModule;
      }
      console.log("Found import statement:", importedModule, "from", modulePath);
      imports.push({ moduleName: importedModule, modulePath });
    });
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