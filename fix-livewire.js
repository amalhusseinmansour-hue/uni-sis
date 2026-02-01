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
  console.log('=== Fixing Livewire/Filament ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. Clear everything..." && \
    php artisan optimize:clear && \
    echo "" && \
    echo "2. Republish Livewire assets..." && \
    php artisan livewire:publish --assets --force && \
    echo "" && \
    echo "3. Republish Filament assets..." && \
    php artisan filament:assets && \
    echo "" && \
    echo "4. Clear Filament cache..." && \
    php artisan filament:clear-cached-components && \
    php artisan filament:cache-components && \
    echo "" && \
    echo "5. Check Livewire config..." && \
    grep -E "asset_url|app_url|manifest_path" config/livewire.php 2>/dev/null || cat config/livewire.php 2>/dev/null | head -30 || echo "Using default Livewire config" && \
    echo "" && \
    echo "6. Publish Livewire config..." && \
    php artisan livewire:publish --config 2>/dev/null || echo "Config already published" && \
    echo "" && \
    echo "7. Check ASSET_URL in .env..." && \
    grep ASSET_URL .env || echo "No ASSET_URL set (using default)" && \
    echo "" && \
    echo "8. Rebuild caches..." && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
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
      console.log('\n\nNow try: https://sis.vertexuniversity.edu.eu/admin');
      console.log('Press Ctrl+Shift+R to hard refresh');
      client.end();
    });
  });
});

client.connect(config);
