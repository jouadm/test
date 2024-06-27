const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Define Salesforce project path and deployment folder path
const sfProjectPath = 'C:\\Users\\safab\\OneDrive\\Desktop\\Salesforce Projects\\connect org button - Copie';
const deploymentFolderPath = path.join(sfProjectPath, 'node_modules', 'deployment', 'JohnDoe', 'MyFolder', 'classes');

app.use(cors());

// Function to deploy all Apex classes from predefined folder based on org alias
function deployAllApexClasses(orgAlias, callback) {
  const command = `sfdx force:source:deploy -p "${deploymentFolderPath}" -u ${orgAlias} --json`;

  exec(command, (error, stdout, stderr) => {
    console.log('Command output:', stdout);
    if (error) {
      console.error(`exec error: ${error}`);
      console.error(`stderr: ${stderr}`);
      callback({
        error: 'Failed to deploy Apex classes',
        details: stderr,
        command
      });
      return;
    }

    try {
      const result = JSON.parse(stdout);
      if (result.status === 0) {
        callback(null, { message: 'Apex classes deployed successfully.', details: result.result });
      } else {
        console.error(`Failed to deploy Apex classes: ${result.message}`);
        callback({
          error: 'Failed to deploy Apex classes',
          details: result.message,
          command
        });
      }
    } catch (parseError) {
      console.error(`Error parsing output: ${parseError}`);
      console.error(`stdout: ${stdout}`);
      callback({
        error: 'Failed to deploy Apex classes',
        details: `Parse error: ${parseError.message}`,
        stdout,
        command
      });
    }
  });
}

// Route to deploy all Apex classes from predefined folder based on org alias provided
app.get('/deployAllApexClasses', (req, res) => {
  const { orgAlias } = req.query;
  if (!orgAlias) {
    return res.status(400).json({ error: 'Org alias is required' });
  }

  deployAllApexClasses(orgAlias, (error, result) => {
    if (error) {
      return res.status(500).json(error);
    }
    res.json(result);
  });
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
