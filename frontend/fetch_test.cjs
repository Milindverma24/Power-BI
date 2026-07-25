const http = require('http');

http.get('http://localhost:5173/src/main.tsx', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    console.log("RESPONSE_BODY:");
    console.log(rawData.substring(0, 500));
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
