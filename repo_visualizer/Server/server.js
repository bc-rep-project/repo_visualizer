// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// Endpoint to read a file and parse imports
app.post('/parse-imports', async (req, res) => {
  const { filePath } = req.body;
  try {
    const fileContents = await fs.promises.readFile(filePath, 'utf8');
    const importRegex = /import\s+((?:\{[^}]+})|(?:\* as [^}]+)|(?:[^,]+))/g;
    const imports = fileContents.match(importRegex) || [];
    const importObjects = imports.map(importStatement => ({
      importedModule: importStatement,
      importingFile: filePath,
    }));
    res.json(importObjects);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Endpoint to calculate file size
app.post('/calculate-file-size', async (req, res) => {
  const { filePath, imports } = req.body;
  try {
    const fileStats = fs.statSync(filePath);
    let fileSize = fileStats.size;

    for (const { importedModule } of imports) {
      const resolvedPath = path.resolve(path.dirname(filePath), importedModule);
      fileSize += (await fs.promises.stat(resolvedPath)).size;
    }
    res.json({ size: fileSize });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
