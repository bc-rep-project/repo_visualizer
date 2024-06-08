const express = require('express');
const path = require('path'); 
const { processLocalRepo } = require('./src/utils/processLocalRepo'); // Adjust path as needed

const app = express();
const port = process.env.PORT || 3001;

app.get('/api/repo', async (req, res) => {
  try {
    const repoPath = req.query.path; // Get the repo path from the request 
    const data = await processLocalRepo(repoPath);
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process repository' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});