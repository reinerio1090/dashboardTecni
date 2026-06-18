const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/debug/kpis?inicio=2026-06-01&fin=2026-06-04&sucursales=B_AZOGUES&rutas=R_CAÑAR',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
    try {
      const json = JSON.parse(data);
      console.log('Parsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Could not parse as JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
