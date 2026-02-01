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
  console.log('=== Final Fix for Livewire/Filament ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. Checking Livewire JavaScript file..." && \
    ls -la public/vendor/livewire/ && \
    echo "" && \
    echo "2. Checking Livewire manifest..." && \
    cat public/vendor/livewire/manifest.json 2>/dev/null | head -5 || echo "No manifest" && \
    echo "" && \
    echo "3. Re-publishing Livewire assets..." && \
    php artisan livewire:publish --assets && \
    echo "" && \
    echo "4. Check public/vendor after publish..." && \
    ls -la public/vendor/livewire/ && \
    echo "" && \
    echo "5. Setting correct permissions..." && \
    chmod -R 755 public/vendor/ && \
    chmod -R 755 public/js/ && \
    chmod -R 755 public/css/ && \
    echo "Permissions set!" && \
    echo "" && \
    echo "6. Test Livewire endpoint..." && \
    php artisan route:list --path=livewire 2>/dev/null | head -5 || echo "Livewire routes OK"`;

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
      console.log('\n=== Try the admin panel now ===');
      client.end();
    });
  });
});

client.connect(config);
