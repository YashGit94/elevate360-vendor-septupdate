const express = require('express');
const path = require('path');
const app = express();

// PRECAUTION: Cloud Run provides the PORT.
const PORT = process.env.PORT || 8080;

/**
 * Serve static files from the Angular build directory.
 * Note: Check your angular.json "outputPath". 
 * For Angular 19, it is usually 'dist/YOUR_PROJECT_NAME/browser'.
 */
app.use(express.static(path.join(__dirname, 'dist/elevate360-frontend/browser')));

// Fallback: Send all requests to index.html (Required for Angular Routing)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/elevate360-frontend/browser/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend serving on port ${PORT}`);
});
