const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { BigQuery } = require('@google-cloud/bigquery');

const app = express();

/**
 * PRECAUTION: Cloud Run provides the PORT environment variable.
 * Your app MUST listen on this port to pass the health check.
 */
const PORT = process.env.PORT || 8080; 

app.use(cors());
app.use(bodyParser.json());

// Initialize BigQuery with ADC (No physical keys.json path needed)
const bigquery = new BigQuery({ projectId: 'elevate360-poc' });

// --- API ROUTES ---
app.get('/api/sdr-by-specialization', async (req, res) => {
  // Your existing BigQuery logic...
});

app.get('/api/escalation-rate', async (req, res) => {
  // Your existing BigQuery logic...
});

// --- FRONTEND INTEGRATION ---
/**
 * Serve the built Angular files from the dist folder.
 * Based on your angular.json, the path is 'dist/sitexx/browser'.
 */
app.use(express.static(path.join(__dirname, 'dist/sitexx/browser')));

// Essential for Angular Routing: redirect all non-API requests to index.html
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/sitexx/browser/index.html'));
});

// CRITICAL: Bind to 0.0.0.0 to ensure reachability from outside the container
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server successfully started and listening on port ${PORT}`);
});
