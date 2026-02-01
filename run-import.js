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
  console.log('Running import script...\n');

  const cmd = `cd /home/sisvertexunivers/public_html/sis && php import-lms-grades.php 2>&1`;
  
  client.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Error:', err.message);
      client.end();
      return;
    }

    stream.on('data', (data) => {
      process.stdout.write(data.toString());
    });

    stream.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
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
