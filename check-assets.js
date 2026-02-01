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
  console.log('=== Checking Assets & Deployment ===\n');

  const checks = [
    { name: '1. Check public/build folder', cmd: `ls -la /home/sisvertexunivers/laravel-backend/public/build/ 2>/dev/null | head -10 || echo "No build folder"` },
    { name: '2. Check Filament assets', cmd: `ls -la /home/sisvertexunivers/laravel-backend/public/css/filament/ 2>/dev/null || echo "No filament css"` },
    { name: '3. Check vendor publish', cmd: `ls /home/sisvertexunivers/laravel-backend/public/vendor/ 2>/dev/null || echo "No vendor folder"` },
    { name: '4. Republish Filament assets', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan filament:assets 2>&1` },
    { name: '5. Check storage link', cmd: `ls -la /home/sisvertexunivers/laravel-backend/public/storage 2>/dev/null || echo "No storage link"` },
    { name: '6. Create storage link if missing', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan storage:link 2>&1 || echo "Already exists"` },
    { name: '7. Check APP_ENV', cmd: `cd /home/sisvertexunivers/laravel-backend && grep "APP_ENV\\|APP_DEBUG" .env` },
    { name: '8. Run npm build if needed', cmd: `cd /home/sisvertexunivers/laravel-backend && test -d node_modules && npm run build 2>&1 | tail -5 || echo "No node_modules"` },
    { name: '9. Check Livewire config', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -A3 "asset_url\\|app_url" config/livewire.php 2>/dev/null || echo "Default config"` },
  ];

  let i = 0;

  function runNext() {
    if (i >= checks.length) {
      client.end();
      return;
    }

    const { name, cmd } = checks[i];
    console.log(`${name}:`);

    client.exec(cmd, (err, stream) => {
      if (err) {
        console.log('  ERROR:', err.message);
        i++;
        runNext();
        return;
      }

      let output = '';
      stream.on('data', (data) => {
        output += data.toString();
      });

      stream.stderr.on('data', (data) => {
        output += data.toString();
      });

      stream.on('close', () => {
        console.log('  ', output.trim() || '(empty)');
        console.log('');
        i++;
        runNext();
      });
    });
  }

  runNext();
});

client.connect(config);
