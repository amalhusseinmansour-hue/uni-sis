const { Client } = require('ssh2');

const conn = new Client();

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@'
};

conn.on('ready', () => {
  console.log('Connected to server\n');

  conn.exec('cd /home/sisvertexunivers/laravel-backend && php artisan optimize:clear', (err, stream) => {
    if (err) {
      console.error('Error:', err);
      conn.end();
      return;
    }

    stream.on('close', (code) => {
      console.log('\nCommand finished with exit code:', code);
      conn.end();
    }).on('data', (data) => {
      console.log(data.toString());
    }).stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
});

conn.on('error', (err) => {
  console.error('Connection Error:', err.message);
});

conn.connect(config);
