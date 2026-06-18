const http = require('http');

const path = '/api/dashboard/kpis?inicio=2026-06-01&fin=2026-06-04&sucursales=B_AZOGUES&rutas=R_CA%C3%B1AR';

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: path,
  method: 'GET',
  headers: {
    'Cookie': 'session=dummy'
  }
};

console.log('Requesting:', path);

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Response body:', data);
    try {
      const json = JSON.parse(data);
      console.log('Parsed:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Not JSON');
    }
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  process.exit(1);
});

req.end();
