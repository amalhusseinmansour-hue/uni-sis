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
  console.log('=== Disabling SPA Mode ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. Backing up AdminPanelProvider..." && \
    cp app/Providers/Filament/AdminPanelProvider.php app/Providers/Filament/AdminPanelProvider.php.bak && \
    echo "" && \
    echo "2. Commenting out ->spa()..." && \
    sed -i 's/->spa()/\\/\\/ ->spa() \\/* DISABLED FOR TESTING *\\//' app/Providers/Filament/AdminPanelProvider.php && \
    echo "" && \
    echo "3. Verifying change..." && \
    grep -n "spa" app/Providers/Filament/AdminPanelProvider.php && \
    echo "" && \
    echo "4. Clearing caches..." && \
    php artisan config:clear && \
    php artisan route:clear && \
    php artisan view:clear && \
    php artisan cache:clear && \
    php artisan filament:clear-cached-components && \
    echo "" && \
    echo "=== Done! Try the admin panel now ===" `;

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
