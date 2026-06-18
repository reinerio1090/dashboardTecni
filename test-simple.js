const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/',
  method: 'GET'
};

console.log('Attempting to connect to localhost:3000...');

const req = http.request(options, (res) => {
  console.log('Connected! Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log('Response length:', data.length); process.exit(0); });
});

req.on('error', (error) => {
  console.error('Connection error:', error.message);
  process.exit(1);
});

req.setTimeout(3000, () => {
  console.error('Request timeout');
  req.destroy();
  process.exit(1);
});

req.end();
