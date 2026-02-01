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
  console.log('=== Finding Grading Scale Files ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. Search for grading files:" && \
    find app -name "*[Gg]rading*" -o -name "*[Ss]cale*" 2>/dev/null && \
    echo "" && \
    echo "2. Check routes for grading:" && \
    php artisan route:list --path=grading 2>/dev/null | head -10 || echo "No routes" && \
    echo "" && \
    echo "3. Check database for grading_scales table:" && \
    php artisan tinker --execute="echo \Schema::hasTable('grading_scales') ? 'EXISTS' : 'NOT FOUND';" 2>/dev/null | tail -1 && \
    echo "" && \
    echo "4. List Filament Pages:" && \
    ls app/Filament/Pages/ 2>/dev/null | head -20`;

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
