const https = require('https');
const fs = require('fs');
const path = require('path');

// Read the JSON file
const filePath = path.join(__dirname, 'src', 'assets', 'products-data.json');
const fileData = fs.readFileSync(filePath, 'utf8');
const jsonData = JSON.parse(fileData);

// Firebase database URL
const firebaseUrl = 'angulartest-93e44-default-rtdb.asia-southeast1.firebasedatabase.app';

// Options for the HTTPS request
const options = {
  hostname: firebaseUrl,
  path: '/products.json',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  }
};

// Create the request
const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log(`Response: ${chunk}`);
  });
});

// Handle errors
req.on('error', (error) => {
  console.error(`Error: ${error.message}`);
});

// Write data to request body
req.write(JSON.stringify(jsonData.products));
req.end();

console.log('Uploading data to Firebase...');
