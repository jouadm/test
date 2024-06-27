const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

const sfProjectPath = 'C:\\Users\\safab\\OneDrive\\Desktop\\SalesForce\\sfdxTraining';

app.use(cors());

// Function to retrieve Apex classes based on org alias
function retrieveApexClasses(orgAlias, callback) {
  const command = `sfdx force:data:soql:query -q "SELECT Name FROM ApexClass" -u ${orgAlias} --json`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      console.error(`stderr: ${stderr}`);
      callback({ error: 'Failed to list Apex classes', details: stderr });
      return;
    }

    try {
      const result = JSON.parse(stdout);
      if (result.status === 0) {
        const apexClasses = result.result.records.map(record => record.Name);
        console.log('Retrieved Apex classes:', apexClasses);
        callback(null, apexClasses);
      } else {
        console.error(`Failed to list Apex classes: ${result.message}`);
        callback({ error: 'Failed to list Apex classes', details: result.message });
      }
    } catch (parseError) {
      console.error(`Error parsing output: ${parseError}`);
      callback({ error: 'Failed to list Apex classes', details: stdout });
    }
  });
}

// Route to retrieve all Apex classes based on org alias provided
app.get('/retrieveAllApexClasses', (req, res) => {
  const { orgAlias } = req.query;
  if (!orgAlias) {
    return res.status(400).json({ error: 'Org alias is required' });
  }

  retrieveApexClasses(orgAlias, (error, apexClasses) => {
    if (error) {
      return res.status(500).json(error);
    }
    res.json({ apexClasses });
  });
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
