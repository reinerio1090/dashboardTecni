const http = require('http');

console.log('Starting test...');

const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/debug/kpis?inicio=2026-06-01&fin=2026-06-04&sucursales=B_AZOGUES&rutas=R_CAÑAR'
}, (res) => {
  console.log('Got response, status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => { 
    console.log('Got data chunk, length:', chunk.length);
    data += chunk; 
  });
  res.on('end', () => {
    console.log('Response complete, total length:', data.length);
    console.log('Data:', data);
    process.exit(0);
  });
});

req.on('error', (e) => { 
  console.error('Request error:', e.message);
  process.exit(1); 
});

req.setTimeout(5000, () => {
  console.error('Timeout');
  req.destroy();
  process.exit(1);
});

console.log('Request sent');
req.end();
