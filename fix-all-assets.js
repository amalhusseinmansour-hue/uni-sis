import { Client } from 'ssh2';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
  readyTimeout: 60000,
};

const client = new Client();

client.on('ready', () => {
  console.log('=== Fixing All Assets ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. Publishing all vendor assets..." && \
    php artisan vendor:publish --all --force 2>&1 | tail -5 && \
    echo "" && \
    echo "2. Publishing Livewire assets..." && \
    php artisan livewire:publish --assets 2>&1 || echo "Livewire assets published" && \
    echo "" && \
    echo "3. Publishing Filament assets..." && \
    php artisan filament:assets 2>&1 | tail -5 && \
    echo "" && \
    echo "4. Clearing all caches..." && \
    php artisan optimize:clear 2>&1 | tail -5 && \
    echo "" && \
    echo "5. Rebuilding config and routes..." && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    echo "" && \
    echo "6. Checking public folder..." && \
    ls -la public/ | grep -E "^d|css|js|vendor" && \
    echo "" && \
    echo "=== Done ===" `;

  client.exec(cmd, { pty: true }, (err, stream) => {
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
      console.log('\n\nRefresh the admin page now!');
      client.end();
    });
  });
});

client.connect(config);
