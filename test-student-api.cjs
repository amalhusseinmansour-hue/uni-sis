const https = require('https');

const options = {
  hostname: 'sis.vertexuniversity.edu.eu',
  path: '/api/students/1',
  method: 'GET',
  headers: {
    'Accept': 'application/json',
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log('Student Data:');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
