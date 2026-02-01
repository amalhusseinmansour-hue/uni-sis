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
  console.log('=== Checking Laravel Logs ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "=== Last 30 lines of Laravel log ===" && \
    tail -30 storage/logs/laravel.log 2>/dev/null || echo "No log file" && \
    echo "" && \
    echo "=== PHP Error Log ===" && \
    tail -20 ~/logs/error.log 2>/dev/null || tail -20 /var/log/php-fpm/error.log 2>/dev/null || echo "No PHP error log found"`;

  client.exec(cmd, (err, stream) => {
    if (err) {
      console.log('Error:', err.message);
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

client.connect(config);
