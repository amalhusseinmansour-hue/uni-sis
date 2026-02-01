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
  console.log('=== Checking Filament Resources ===\n');

  const checks = [
    { name: '1. StudentResource - check for scopes', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -n "getEloquentQuery\\|scopedTo\\|tenant" app/Filament/Resources/StudentResource.php 2>/dev/null || echo "No tenant scope found"` },
    { name: '2. GradeResource - check for scopes', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -n "getEloquentQuery\\|scopedTo\\|tenant" app/Filament/Resources/GradeResource.php 2>/dev/null || echo "No tenant scope found"` },
    { name: '3. List all Filament resources', cmd: `ls /home/sisvertexunivers/laravel-backend/app/Filament/Resources/*.php | xargs -I{} basename {} .php` },
    { name: '4. Check if StudentResource exists', cmd: `test -f /home/sisvertexunivers/laravel-backend/app/Filament/Resources/StudentResource.php && echo "EXISTS" || echo "NOT FOUND"` },
    { name: '5. Check StudentResource model', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -A2 "public static function getModel" app/Filament/Resources/StudentResource.php 2>/dev/null || echo "Not found"` },
    { name: '6. Test direct query from Filament context', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="
      \\$count = \\App\\Models\\Student::count();
      echo 'Student model count: ' . \\$count;
    " 2>/dev/null | tail -1` },
    { name: '7. Check for soft deletes', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -n "SoftDeletes\\|deleted_at" app/Models/Student.php 2>/dev/null || echo "No soft deletes"` },
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
