const { Client } = require('ssh2');

const conn = new Client();

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@'
};

conn.on('ready', () => {
  console.log('Connected to server');

  // Search for RTL-related code in the JS file
  conn.exec('grep -o "dir.*rtl" /home/sisvertexunivers/public_html/assets/index-B9qadlOo.js | head -5', (err, stream) => {
    if (err) {
      console.error('Error:', err);
      conn.end();
      return;
    }

    stream.on('close', () => {
      conn.end();
    }).on('data', (data) => {
      console.log('Found RTL code:\n' + data.toString());
    }).stderr.on('data', (data) => {
      console.error('STDERR: ' + data);
    });
  });
});

conn.on('error', (err) => {
  console.error('Connection Error:', err.message);
});

conn.connect(config);
