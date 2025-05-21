const fetch = require('node-fetch');
const PDFDocument = require("pdfkit");
const fs = require("fs");
const express = require('express');
require('dotenv').config();
const hbs = require('hbs');
const pdf = require('pdf-creator-node');

const app = express();
const PORT = 3000;
const api_url = process.env.api_url;

app.set('view engine', 'hbs');

// GraphQL query
const query = `
  query {
    patientByName(name: "Emma Thompson") {
      id
      name
      age
      carePlans {
        id
        title
        description
        goals
        careTeam {
          id
          name
          role
        }
      }
    }
  }
`;

function fetchCarePlans() {
  return fetch(api_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const return_data = response.json();
      console.log(return_data);
      return return_data;
    })
    .then(json => json.data.patientByName)
    .catch(error => {
      console.error('Error fetching data:', error);
      return null;
    });
}

app.get('/', (req, res) => {
  res.render('demo'); 
});

app.get('/data', (req, res) => {
  fetchCarePlans()
    .then(patient => {
      if (patient) {
        res.render('demo', { patient });
      } else {
        res.status(500).send('Failed to fetch patient data');
      }
    });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});