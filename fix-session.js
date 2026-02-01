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
  console.log('=== Fixing Session Configuration ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. Current SESSION settings:" && \
    grep SESSION .env && \
    echo "" && \
    echo "2. Updating SESSION_DOMAIN..." && \
    sed -i 's/SESSION_DOMAIN=null/SESSION_DOMAIN=.vertexuniversity.edu.eu/' .env && \
    echo "" && \
    echo "3. New SESSION settings:" && \
    grep SESSION .env && \
    echo "" && \
    echo "4. Clearing session table..." && \
    php artisan session:table 2>/dev/null || echo "Session table exists" && \
    php artisan tinker --execute="\\DB::table('sessions')->truncate(); echo 'Sessions cleared!';" 2>/dev/null | tail -1 && \
    echo "" && \
    echo "5. Rebuilding config cache..." && \
    php artisan config:cache && \
    echo "" && \
    echo "=== Done! ===" `;

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
      console.log('\nPlease logout and login again to the admin panel.');
      client.end();
    });
  });
});

client.connect(config);
