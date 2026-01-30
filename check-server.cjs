const { Client } = require('ssh2');

const conn = new Client();

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@'
};

conn.on('ready', () => {
  console.log('✅ SSH Connected to server');
  
  conn.exec('uptime && df -h && tail -20 /home/sisvertexunivers/public_html/error_log 2>/dev/null || echo "No error log"', (err, stream) => {
    if (err) {
      console.error('Error:', err);
      conn.end();
      return;
    }

    stream.on('close', () => {
      conn.end();
    }).on('data', (data) => {
      console.log(data.toString());
    }).stderr.on('data', (data) => {
      console.error('STDERR: ' + data);
    });
  });
});

conn.on('error', (err) => {
  console.error('❌ Connection Error:', err.message);
});

conn.connect(config);
