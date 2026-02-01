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
  console.log('=== Checking .htaccess and config ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. Public .htaccess:" && \
    cat public/.htaccess && \
    echo "" && \
    echo "2. Session config:" && \
    grep -E "driver|domain|secure|same_site" config/session.php | head -10 && \
    echo "" && \
    echo "3. Check SESSION and SANCTUM in .env:" && \
    grep -E "SESSION_|SANCTUM_" .env && \
    echo "" && \
    echo "4. Check APP_URL:" && \
    grep APP_URL .env`;

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
