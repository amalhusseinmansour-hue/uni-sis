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
  console.log('=== Fixing CSRF and Livewire Issues ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. Check VerifyCsrfToken middleware..." && \
    cat app/Http/Middleware/VerifyCsrfToken.php && \
    echo "" && \
    echo "2. Check Livewire middleware..." && \
    grep -r "livewire" app/Http/Kernel.php 2>/dev/null || echo "No specific livewire middleware" && \
    echo "" && \
    echo "3. Check cors.php config..." && \
    cat config/cors.php | head -30 && \
    echo "" && \
    echo "4. Clear all and rebuild..." && \
    php artisan cache:clear && \
    php artisan config:clear && \
    php artisan route:clear && \
    php artisan view:clear && \
    rm -rf bootstrap/cache/*.php && \
    php artisan package:discover && \
    php artisan config:cache && \
    php artisan route:cache && \
    echo "" && \
    echo "=== Done ===" `;

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
