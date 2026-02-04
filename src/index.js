const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { BigQuery } = require('@google-cloud/bigquery');

const app = express();

/** * PRECAUTION: Cloud Run provides the PORT environment variable.
 * Your app MUST listen on this port to pass the health check.
 */
const PORT = process.env.PORT || 8080; 

app.use(cors());
app.use(bodyParser.json());

// Initialize BigQuery with ADC (No keys.json file required in code)
const bigquery = new BigQuery({ projectId: 'elevate360-poc' });

// --- API ROUTES ---
app.get('/api/sdr-by-specialization', async (req, res) => {
  const { startDate, endDate, businessLine, site } = req.query;
  let filters = ["string_field_18 = 'TRUE'", "PARSE_DATE('%m/%d/%Y', string_field_4) BETWEEN @startDate AND @endDate"];
  const params = { startDate, endDate };
  if (site && site !== 'Select') { filters.push("TRIM(string_field_14) = @site"); params.site = site.trim(); }
  if (businessLine && businessLine !== 'Select') { filters.push("string_field_5 = @businessLine"); params.businessLine = businessLine.trim(); }

  const query = `SELECT string_field_10 AS specialization, COUNT(*) AS sdr_count 
                 FROM \`elevate360-poc.hyd_core_data.core-metrics\` 
                 WHERE ${filters.join(' AND ')} GROUP BY 1 ORDER BY 2 DESC`;
  try {
    const [rows] = await bigquery.query({ query, params });
    res.json(rows);
  } catch (err) {
    console.error('BigQuery Error:', err);
    res.status(500).send('Query Failed');
  }
});

app.get('/api/escalation-rate', async (req, res) => {
  const { startDate, endDate, businessLine, site } = req.query;
  let filters = ["string_field_18 = 'TRUE'", "PARSE_DATE('%m/%d/%Y', string_field_4) BETWEEN @startDate AND @endDate"];
  const params = { startDate, endDate };
  if (site && site !== 'Select') { filters.push("TRIM(string_field_14) = @site"); params.site = site.trim(); }
  if (businessLine && businessLine !== 'Select') { filters.push("string_field_5 = @businessLine"); params.businessLine = businessLine.trim(); }

  const query = `SELECT COUNTIF(string_field_19 = 'TRUE') AS total_escalation, COUNT(*) AS total_closed_volume, 
                 SAFE_DIVIDE(COUNTIF(string_field_19 = 'TRUE'), COUNT(*)) AS escalation_rate 
                 FROM \`elevate360-poc.hyd_core_data.core-metrics\` WHERE ${filters.join(' AND ')}`;
  try {
    const [rows] = await bigquery.query({ query, params });
    res.json(rows[0]);
  } catch (err) {
    console.error('BigQuery Error:', err);
    res.status(500).send('Query Failed');
  }
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

// CRITICAL: Bind to 0.0.0.0 for external reachability
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server successfully started and listening on port ${PORT}`);
});
