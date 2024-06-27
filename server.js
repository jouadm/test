const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/connectOrg', (req, res) => {
  exec('sfdx force:auth:web:login --setalias sfdxTraining-Org --instanceurl https://login.salesforce.com --json', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: 'Failed to connect to Salesforce org', details: stderr });
    }

    try {
      const result = JSON.parse(stdout);
      if (result.status === 0) {
        res.json({ message: 'Connected to Salesforce org successfully.' });
      } else {
        console.error(`Failed to connect to Salesforce org: ${result.message}`);
        res.status(500).json({ error: 'Failed to connect to Salesforce org', details: result.message });
      }
    } catch (parseError) {
      console.error(`Error parsing output: ${parseError}`);
      console.error(`stdout: ${stdout}`);
      res.status(500).json({ error: 'Failed to connect to Salesforce org', details: `Parse error: ${parseError.message}`, stdout });
    }
  });
});

app.get('/getAccessToken', (req, res) => {
  exec('sfdx force:org:display -u sfdxTraining-Org --json', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Failed to retrieve access token', details: stderr });
    }
    try {
      const orgInfo = JSON.parse(stdout);
      const accessToken = orgInfo.result.accessToken;
      res.json({ accessToken });
    } catch (parseError) {
      console.error(`Error parsing output: ${parseError}`);
      res.status(500).json({ error: 'Failed to parse access token', details: stdout });
    }
  });
});

app.get('/salesforce/user-info', (req, res) => {
  const { accessToken } = req.query;
  const salesforceInstanceUrl = 'https://devsafa-dev-ed.develop.my.salesforce.com';

  axios.get(`${salesforceInstanceUrl}/services/oauth2/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  .then(response => {
    const { user_id, name, email } = response.data;
    res.json({ user_id, name, email });
  })
  .catch(error => {
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error in request setup:', error.message);
    }
    res.status(500).json({ error: 'Failed to fetch user information', details: error.message });
  });
});
app.get('/createFolder', (req, res) => {
  const { folderName, userName } = req.query;
  if (!folderName || !userName) {
    return res.status(400).json({ error: 'Folder name and user name are required' });
  }

  const userFolderPath = path.join(__dirname, 'deployment', userName, folderName);
  fs.mkdir(userFolderPath, { recursive: true }, (error) => {
    if (error) {
      console.error(`Failed to create folder: ${error.message}`);
      return res.status(500).json({ error: 'Failed to create folder' });
    }
    res.json({ message: `Deployment folder '${folderName}' for user '${userName}' created successfully.` });
  });
});

const sfProjectPath = 'C:\\Users\\safab\\OneDrive\\Desktop\\SalesForce\\sfdxTraining';

app.get('/retrieveApexClass', (req, res) => {
  const { folderName, userName } = req.query;
  if (!folderName || !userName) {
    return res.status(400).json({ error: 'Folder name and user name are required' });
  }

  const userFolderPath = path.join(__dirname, 'deployment', userName, folderName);

  // Ensure the deployment folder exists before proceeding
  fs.mkdir(userFolderPath, { recursive: true }, (error) => {
    if (error) {
      console.error(`Failed to create output directory: ${error.message}`);
      return res.status(500).json({ error: 'Failed to create output directory' });
    }

    const command = `cd "${sfProjectPath}" && sfdx force:source:retrieve -m ApexClass:HelloWorld -u sfdxTraining-Org --json -r "${userFolderPath}"`;

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
          res.json({ message: 'Apex class retrieved successfully.' });
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

app.get('/deployApexClass', (req, res) => {
  const { folderName, userName } = req.query;
  if (!folderName || !userName) {
    return res.status(400).json({ error: 'Folder name and user name are required' });
  }

  const userFolderPath = path.join(__dirname, 'deployment', userName, folderName);
  const command = `cd "${sfProjectPath}" && sfdx force:source:deploy -p "${userFolderPath}" -u sfdxTraining-Org --json`;

  exec(command, (error, stdout, stderr) => {
    console.log('Command executed:', command);
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
        res.json({ message: 'Apex class deployed successfully.' });
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

app.get('/listApexClasses', (req, res) => {
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


app.get('/listFolders', (req, res) => {
  const { userName } = req.query;
  if (!userName) {
    return res.status(400).json({ error: 'User name is required' });
  }

  const userFolderPath = path.join(__dirname, 'deployment', userName);

  fs.readdir(userFolderPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(`Failed to list folders: ${err.message}`);
      return res.status(500).json({ error: 'Failed to list folders' });
    }

    const folders = files
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    res.json({ folders });
  });
});

app.get('/deleteFolder', (req, res) => {
  const { folderName, userName } = req.query;
  if (!folderName || !userName) {
    return res.status(400).json({ error: 'Folder name and user name are required' });
  }

  const userFolderPath = path.join(__dirname, 'deployment', userName, folderName);

  fs.rmdir(userFolderPath, { recursive: true }, (err) => {
    if (err) {
      console.error(`Failed to delete folder: ${err.message}`);
      return res.status(500).json({ error: 'Failed to delete folder' });
    }
    res.json({ message: `Folder '${folderName}' for user '${userName}' deleted successfully.` });
  });
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
