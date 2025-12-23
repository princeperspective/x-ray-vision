const fs = require('fs');
const path = require('path');
const http = require('http');

// 1. Read the Service file to find the API_URL
const servicePath = path.join(__dirname, '../services/ObjectRecognitionService.ts');
const serviceContent = fs.readFileSync(servicePath, 'utf8');

// Regex to find: [const|let] API_URL = 'http://(IP):(PORT)/predict';
const match = serviceContent.match(/(?:const|let)\s+API_URL\s*=\s*['"](http:\/\/[^:]+):(\d+)\/predict['"];/);

if (!match) {
    console.error("❌ Could not find API_URL in ObjectRecognitionService.ts");
    process.exit(1);
}

const baseUrl = match[1]; // http://172.xx.xx.xx
const port = match[2];    // 8000
const hostname = baseUrl.replace('http://', '');

console.log(`Checking connection to: ${baseUrl}:${port}`);

const options = {
  hostname: hostname,
  port: port,
  path: '/',
  method: 'GET',
  timeout: 5000,
};

const req = http.request(options, (res) => {
  console.log(`\n✅ STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
      console.log("✅ Backend is reachable!");
  } else {
      console.log("⚠️  Backend reachable but returned error status.");
  }
  
  res.on('data', (d) => {
    console.log(`Response: ${d.toString().trim()}`);
  });
});

req.on('error', (e) => {
  console.error(`\n❌ PROBLEM: ${e.message}`);
  console.error("Troubleshooting:");
  console.error("1. Ensure 'python backend/main.py' is running.");
  console.error("2. Ensure the IP address matches your machine.");
  process.exit(1);
});

req.on('timeout', () => {
    req.destroy();
    console.error("\n❌ TIMEOUT: Connection timed out.");
});

req.end();
