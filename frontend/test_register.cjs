const http = require('http');

const data = JSON.stringify({
  firstName: "Admin",
  lastName: "User",
  email: "admin@admin.com",
  password: "password123",
  role: "ORG_ADMIN"
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/v1/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    console.log("RESPONSE_BODY:");
    console.log(rawData);
  });
});

req.on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});

req.write(data);
req.end();
