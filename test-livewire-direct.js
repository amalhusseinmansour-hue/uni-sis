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
  console.log('=== Testing Livewire Direct ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. Check Laravel version..." && \
    php artisan --version && \
    echo "" && \
    echo "2. Check Livewire version..." && \
    composer show livewire/livewire 2>/dev/null | grep -E "^name|^versions" && \
    echo "" && \
    echo "3. Check Filament version..." && \
    composer show filament/filament 2>/dev/null | grep -E "^name|^versions" && \
    echo "" && \
    echo "4. Test if admin page renders..." && \
    php artisan tinker --execute="
      \\$request = \\Illuminate\\Http\\Request::create('/admin/students', 'GET');
      \\$kernel = app(\\Illuminate\\Contracts\\Http\\Kernel::class);
      \\$response = \\$kernel->handle(\\$request);
      echo 'Status: ' . \\$response->getStatusCode();
    " 2>/dev/null | tail -1 && \
    echo "" && \
    echo "5. Check bootstrap/app.php for middleware..." && \
    grep -A10 "withMiddleware" bootstrap/app.php 2>/dev/null | head -15 || echo "Standard middleware"`;

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
