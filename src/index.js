const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { BigQuery } = require('@google-cloud/bigquery');

// Scopes are automatically handled by the Cloud Run service account roles
const app = express();
// Cloud Run provides the port via the PORT environment variable
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Initialize BigQuery without keyFilename to use Application Default Credentials (ADC)
// This works automatically when deployed to Google Cloud
const bigquery = new BigQuery({
  projectId: 'elevate360-poc'
});

app.get('/api/sdr-by-specialization', async (req, res) => {
  const { startDate, endDate, businessLine, site } = req.query;
  let filters = [
    "string_field_18 = 'TRUE'",
    "PARSE_DATE('%m/%d/%Y', string_field_4) BETWEEN @startDate AND @endDate"
  ];
  const params = { startDate, endDate };
  
  if (site && site !== 'Select') {
    filters.push("TRIM(string_field_14) = @site");
    params.site = site.trim();
  }
  if (businessLine && businessLine !== 'Select') {
    filters.push("string_field_5 = @businessLine");
    params.businessLine = businessLine.trim();
  }
  
  const whereClause = filters.join(' AND ');
  const query = `
    SELECT
      string_field_10 AS specialization,
      COUNT(*) AS sdr_count 
    FROM
      \`elevate360-poc.hyd_core_data.core-metrics\`
    WHERE
      ${whereClause}
    GROUP BY 
      string_field_10
    ORDER BY
      sdr_count DESC
  `;
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
  let filters = [
    "string_field_18 = 'TRUE'",
    "PARSE_DATE('%m/%d/%Y', string_field_4) BETWEEN @startDate AND @endDate"
  ];
  const params = { startDate, endDate };
  
  if (site && site !== 'Select') {
    filters.push("TRIM(string_field_14) = @site");
    params.site = site.trim();
  }
  if (businessLine && businessLine !== 'Select') {
    filters.push("string_field_5 = @businessLine");
    params.businessLine = businessLine.trim();
  }
  
  const whereClause = filters.join(' AND ');
  const query = `
    SELECT
      COUNTIF(string_field_19 = 'TRUE') AS total_escalation,
      COUNT(*) AS total_closed_volume,
      SAFE_DIVIDE(COUNTIF(string_field_19 = 'TRUE'), COUNT(*)) AS escalation_rate
    FROM
      \`elevate360-poc.hyd_core_data.core-metrics\`
    WHERE
      ${whereClause}
  `;
  try {
    const [rows] = await bigquery.query({ query, params });
    res.json(rows[0]);
  } catch (err) {
    console.error('BigQuery Error:', err);
    res.status(500).send('Query Failed');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
