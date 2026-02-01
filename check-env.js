import { Client } from 'ssh2';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
  readyTimeout: 30000,
};

const client = new Client();

client.on('ready', () => {
  console.log('Connected! Checking Moodle config...\n');

  client.exec('grep -i moodle /home/sisvertexunivers/laravel-backend/.env 2>/dev/null || echo "No Moodle config found"', (err, stream) => {
    if (err) {
      console.error('Error:', err.message);
      client.end();
      return;
    }

    stream.on('data', (data) => {
      console.log(data.toString());
    });

    stream.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    stream.on('close', () => {
      client.end();
    });
  });
});

client.on('error', (err) => {
  console.error('Connection error:', err.message);
});

client.connect(config);
