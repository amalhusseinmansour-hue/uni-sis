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
  console.log('=== Testing Admin Panel Access ===\n');

  // Test local access to admin panel
  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. Testing admin route exists..." && \
    php artisan route:list --path=admin 2>/dev/null | head -10 && \
    echo "" && \
    echo "2. Testing Filament panel..." && \
    php artisan tinker --execute="
      \\$panels = \\Filament\\Facades\\Filament::getPanels();
      foreach(\\$panels as \\$id => \\$panel) {
        echo 'Panel: ' . \\$id . ' Path: ' . \\$panel->getPath() . PHP_EOL;
      }
    " 2>/dev/null | tail -5 && \
    echo "" && \
    echo "3. Checking if there's is_active filter..." && \
    grep -r "is_active" app/Filament/Resources/StudentResource.php 2>/dev/null || echo "No is_active filter" && \
    echo "" && \
    echo "4. Test direct model access in Filament..." && \
    php artisan tinker --execute="
      // Simulate what Filament does
      \\$model = \\App\\Filament\\Resources\\StudentResource::getModel();
      \\$query = \\$model::query();
      echo 'Model: ' . \\$model . PHP_EOL;
      echo 'Query count: ' . \\$query->count() . PHP_EOL;
    " 2>/dev/null | tail -5`;

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
