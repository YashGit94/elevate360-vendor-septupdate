const express = require('express');
const { BigQuery } = require('@google-cloud/bigquery');
const app = express();

// PRECAUTION: Cloud Run provides the PORT. Listening elsewhere causes failure.
const PORT = process.env.PORT || 8080; 

app.use(require('cors')());
app.use(require('body-parser').json());

// PRECAUTION: ADC is used. No keys.json needed.
const bigquery = new BigQuery({ projectId: 'elevate360-poc' });

// Health Check endpoint for Cloud Run prober
app.get('/', (req, res) => res.status(200).send('Backend Ready'));

app.get('/api/sdr-by-specialization', async (req, res) => {
  const { startDate, endDate } = req.query;
  const query = `SELECT string_field_10 AS specialization, COUNT(*) AS sdr_count 
                 FROM \`elevate360-poc.hyd_core_data.core-metrics\` 
                 WHERE PARSE_DATE('%m/%d/%Y', string_field_4) BETWEEN @startDate AND @endDate 
                 GROUP BY 1 ORDER BY 2 DESC`;
  try {
    const [rows] = await bigquery.query({ query, params: { startDate, endDate } });
    res.json(rows);
  } catch (err) {
    console.error('BigQuery Error:', err);
    res.status(500).send('Query Failed');
  }
});

// Bind to 0.0.0.0 to be visible to the Cloud Run Network
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cloud Run is now routing traffic to port: ${PORT}`);
});
