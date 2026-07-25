const http = require('http');

const data = JSON.stringify({
  email: "admin@admin.com",
  password: "password123"
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/v1/auth/authenticate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`LOCATION: ${res.headers.location}`);
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
