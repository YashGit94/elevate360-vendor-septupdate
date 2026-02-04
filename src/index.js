const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');

const app = express();
// Cloud Run injects the PORT. We must use it or default to 8080.
const PORT = process.env.PORT || 8080; 

app.use(cors());
app.use(bodyParser.json());

// Configuration object for BigQuery
let bqConfig = {
  projectId: 'elevate360-poc'
};

/**
 * STRATEGY: Use Environment variable for credentials.
 * This avoids keeping a physical keys.json file in the src folder.
 */
if (process.env.GCP_CREDENTIALS_BASE64) {
  try {
    const decodedKey = Buffer.from(process.env.GCP_CREDENTIALS_BASE64, 'base64').toString();
    bqConfig.credentials = JSON.parse(decodedKey);
    console.log('BigQuery initialized using Environment Variable.');
  } catch (err) {
    console.error('Failed to parse GCP_CREDENTIALS_BASE64:', err);
  }
}

const bigquery = new BigQuery(bqConfig);

// ... (Your existing endpoints: /api/sdr-by-specialization and /api/escalation-rate)

// CRITICAL: Bind to 0.0.0.0 to ensure the container is reachable by the Cloud Run health check
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server started successfully on port ${PORT}`);
});
