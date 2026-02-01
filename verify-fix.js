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
  console.log('=== Verifying fix ===\n');

  const cmd = `grep -n "semester:id" /home/sisvertexunivers/laravel-backend/app/Http/Controllers/Api/ReportController.php && \
    echo "" && \
    grep -n "academic_year" /home/sisvertexunivers/laravel-backend/app/Http/Controllers/Api/ReportController.php | head -5`;

  client.exec(cmd, (err, stream) => {
    if (err) {
      console.log('Error:', err.message);
      client.end();
      return;
    }

    stream.on('data', (data) => {
      process.stdout.write(data.toString());
    });

    stream.on('close', () => {
      client.end();
    });
  });
});

client.connect(config);
