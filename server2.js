const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

const sfProjectPath = 'C:\\Users\\safab\\OneDrive\\Desktop\\SalesForce\\sfdxTraining';

app.use(cors());

// Route to retrieve Apex classes based on org alias provided in the query parameters
app.get('/retrieveApexClass', (req, res) => {
  const { folderName, userName, orgAlias } = req.query;
  if (!folderName || !userName || !orgAlias) {
    return res.status(400).json({ error: 'Folder name, user name, and org alias are required' });
  }

  const userFolderPath = path.join(__dirname, 'deployment', userName, folderName);

  // Ensure the deployment folder exists before proceeding
  fs.mkdir(userFolderPath, { recursive: true }, (error) => {
    if (error) {
      console.error(`Failed to create output directory: ${error.message}`);
      return res.status(500).json({ error: 'Failed to create output directory' });
    }

    const command = `cd "${sfProjectPath}" && sfdx force:source:retrieve -m ApexClass:HelloWorld -u ${orgAlias} --json -r "${userFolderPath}"`;

    exec(command, (error, stdout, stderr) => {
      console.log('Command output:', stdout);
      if (error) {
        console.error(`exec error: ${error}`);
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ 
          error: 'Failed to retrieve Apex class', 
          details: error.message, 
          stderr,
          command
        });
      }

      try {
        const result = JSON.parse(stdout);
        if (result.status === 0) {
          res.json({ message: 'Apex class retrieved successfully.', details: result.result });
        } else {
          console.error(`Failed to retrieve Apex class: ${result.message}`);
          res.status(500).json({ error: 'Failed to retrieve Apex class', details: result.message });
        }
      } catch (parseError) {
        console.error(`Error parsing output: ${parseError}`);
        console.error(`stdout: ${stdout}`);
        res.status(500).json({ 
          error: 'Failed to retrieve Apex class', 
          details: `Parse error: ${parseError.message}`, 
          stdout,
          command
        });
      }
    });
  });
});


// Route to retrieve Apex classes based on org alias provided in the query parameters
app.get('/retrieveAllApexClass', (req, res) => {
  const { folderName, userName, orgAlias } = req.query;
  if (!folderName || !userName || !orgAlias) {
    return res.status(400).json({ error: 'Folder name, user name, and org alias are required' });
  }

  const userFolderPath = path.join(__dirname, 'deployment', userName, folderName);

  // Ensure the deployment folder exists before proceeding
  fs.mkdir(userFolderPath, { recursive: true }, (error) => {
    if (error) {
      console.error(`Failed to create output directory: ${error.message}`);
      return res.status(500).json({ error: 'Failed to create output directory' });
    }

    const command = `cd "${sfProjectPath}" && sfdx force:source:retrieve -m ApexClass -u ${orgAlias} --json -r "${userFolderPath}"`;

    exec(command, (error, stdout, stderr) => {
      console.log('Command output:', stdout);
      if (error) {
        console.error(`exec error: ${error}`);
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ 
          error: 'Failed to retrieve Apex class', 
          details: error.message, 
          stderr,
          command
        });
      }

      try {
        const result = JSON.parse(stdout);
        if (result.status === 0) {
          res.json({ message: 'Apex class retrieved successfully.', details: result.result });
        } else {
          console.error(`Failed to retrieve Apex class: ${result.message}`);
          res.status(500).json({ error: 'Failed to retrieve Apex class', details: result.message });
        }
      } catch (parseError) {
        console.error(`Error parsing output: ${parseError}`);
        console.error(`stdout: ${stdout}`);
        res.status(500).json({ 
          error: 'Failed to retrieve Apex class', 
          details: `Parse error: ${parseError.message}`, 
          stdout,
          command
        });
      }
    });
  });
});

// Route to deploy Apex classes based on org alias provided in the query parameters
app.get('/deployApexClass', (req, res) => {
  const { folderName, userName, orgAlias } = req.query;
  if (!folderName || !userName || !orgAlias) {
    return res.status(400).json({ error: 'Folder name, user name, and org alias are required' });
  }

  const userFolderPath = path.join(__dirname, 'deployment', userName, folderName);

  const command = `cd "${sfProjectPath}" && sfdx force:source:deploy -p "${userFolderPath}" -u ${orgAlias} --json`;

  exec(command, (error, stdout, stderr) => {
    console.log('Command output:', stdout);
    if (error) {
      console.error(`exec error: ${error}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ 
        error: 'Failed to deploy Apex class', 
        details: error.message, 
        stderr,
        command
      });
    }

    try {
      const result = JSON.parse(stdout);
      if (result.status === 0) {
        res.json({ message: 'Apex class deployed successfully.', details: result.result });
      } else {
        console.error(`Failed to deploy Apex class: ${result.message}`);
        res.status(500).json({ error: 'Failed to deploy Apex class', details: result.message });
      }
    } catch (parseError) {
      console.error(`Error parsing output: ${parseError}`);
      console.error(`stdout: ${stdout}`);
      res.status(500).json({ 
        error: 'Failed to deploy Apex class', 
        details: `Parse error: ${parseError.message}`, 
        stdout,
        command
      });
    }
  });
});
app.get('/deployApexClass1', (req, res) => {
  const { folderName, userName, orgAlias } = req.query;
  if (!folderName || !userName || !orgAlias) {
    return res.status(400).json({ error: 'Folder name, user name, and org alias are required' });
  }

  const userFolderPath = path.join(__dirname, 'classes', userName, folderName);

  const command = `cd "${sfProjectPath}" && sfdx force:source:deploy -p "${userFolderPath}" -u ${orgAlias} --json`;

  exec(command, (error, stdout, stderr) => {
    console.log('Command output:', stdout);
    if (error) {
      console.error(`exec error: ${error}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ 
        error: 'Failed to deploy Apex class', 
        details: error.message, 
        stderr,
        command
      });
    }

    try {
      const result = JSON.parse(stdout);
      if (result.status === 0) {
        res.json({ message: 'Apex class deployed successfully.', details: result.result });
      } else {
        console.error(`Failed to deploy Apex class: ${result.message}`);
        res.status(500).json({ error: 'Failed to deploy Apex class', details: result.message });
      }
    } catch (parseError) {
      console.error(`Error parsing output: ${parseError}`);
      console.error(`stdout: ${stdout}`);
      res.status(500).json({ 
        error: 'Failed to deploy Apex class', 
        details: `Parse error: ${parseError.message}`, 
        stdout,
        command
      });
    }
  });
});

// Route to test and display the retrieved Apex classes based on org alias provided
app.get('/testRetrieveApexClass', (req, res) => {
  const { orgAlias } = req.query;
  if (!orgAlias) {
    return res.status(400).json({ error: 'Org alias is required' });
  }

  const command = `sfdx force:data:soql:query -q "SELECT Name FROM ApexClass" -u ${orgAlias} --json`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: 'Failed to list Apex classes', details: stderr });
    }

    try {
      const result = JSON.parse(stdout);
      if (result.status === 0) {
        const apexClasses = result.result.records.map(record => record.Name);
        console.log('Retrieved Apex classes:', apexClasses);
        res.json({ apexClasses });
      } else {
        console.error(`Failed to list Apex classes: ${result.message}`);
        res.status(500).json({ error: 'Failed to list Apex classes', details: result.message });
      }
    } catch (parseError) {
      console.error(`Error parsing output: ${parseError}`);
      res.status(500).json({ error: 'Failed to list Apex classes', details: stdout });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
