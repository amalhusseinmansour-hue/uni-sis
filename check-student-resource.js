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
  console.log('=== Checking StudentResource in Filament ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && cat app/Filament/Resources/StudentResource.php | head -300`;

  client.exec(cmd, (err, stream) => {
    if (err) {
      console.log('Error:', err.message);
      client.end();
      return;
    }

    let output = '';
    stream.on('data', (data) => {
      output += data.toString();
    });

    stream.on('close', () => {
      console.log(output);
      client.end();
    });
  });
});

client.connect(config);
