const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

const sfProjectPath = 'C:\\Users\\safab\\OneDrive\\Desktop\\SalesForce\\sfdxTraining';

app.use(cors());

// Function to retrieve all Apex classes based on org alias and save them to the same directory as server2.js
function retrieveAllApexClasses(orgAlias, callback) {
  const outputFolderPath = path.join(__dirname, orgAlias); // Folder path to save retrieved classes
  
  // Ensure the output folder exists before proceeding
  fs.mkdir(outputFolderPath, { recursive: true }, (error) => {
    if (error) {
      console.error(`Failed to create output directory: ${error.message}`);
      callback({ error: 'Failed to create output directory' });
      return;
    }

    const command = `sfdx force:source:retrieve -m ApexClass -u ${orgAlias} -r "${outputFolderPath}" --json`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        console.error(`stderr: ${stderr}`);
        callback({ 
          error: 'Failed to retrieve Apex classes', 
          details: stderr 
        });
        return;
      }

      try {
        const result = JSON.parse(stdout);
        if (result.status === 0) {
          const retrievedFiles = result.result.inboundFiles;
          const apexClasses = retrievedFiles.filter(file => file.type === 'ApexClass').map(file => ({
            fullName: file.fullName,
            content: file.content
          }));
          console.log('Retrieved Apex classes:', apexClasses);

          // Save each Apex class to a file
          apexClasses.forEach(apexClass => {
            const filePath = path.join(outputFolderPath, `${apexClass.fullName}.cls`);
            fs.writeFile(filePath, apexClass.content, 'utf8', (err) => {
              if (err) {
                console.error(`Failed to write file ${filePath}: ${err}`);
              } else {
                console.log(`Saved Apex class ${apexClass.fullName} to ${filePath}`);
              }
            });
          });

          callback(null, apexClasses);
        } else {
          console.error(`Failed to retrieve Apex classes: ${result.message}`);
          callback({ 
            error: 'Failed to retrieve Apex classes', 
            details: result.message 
          });
        }
      } catch (parseError) {
        console.error(`Error parsing output: ${parseError}`);
        callback({ 
          error: 'Failed to retrieve Apex classes', 
          details: stdout 
        });
      }
    });
  });
}

// Route to retrieve all Apex classes based on org alias provided
app.get('/retrieveAllApexClasses', (req, res) => {
  const { orgAlias } = req.query;
  if (!orgAlias) {
    return res.status(400).json({ error: 'Org alias is required' });
  }

  retrieveAllApexClasses(orgAlias, (error, apexClasses) => {
    if (error) {
      return res.status(500).json(error);
    }
    res.json({ apexClasses });
  });
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
