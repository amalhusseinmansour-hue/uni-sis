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
  console.log('=== Deep Debug Filament ===\n');

  const checks = [
    { name: '1. Check StudentResource getEloquentQuery', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -A10 "getEloquentQuery" app/Filament/Resources/StudentResource.php 2>/dev/null || echo "No custom query"` },
    { name: '2. Check Student model global scopes', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -n "addGlobalScope\\|booted\\|boot(" app/Models/Student.php 2>/dev/null || echo "No global scopes"` },
    { name: '3. Check if is_active column exists', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \\Schema::hasColumn('students', 'is_active') ? 'YES' : 'NO';" 2>/dev/null | tail -1` },
    { name: '4. Check students table columns', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo implode(', ', \\Schema::getColumnListing('students'));" 2>/dev/null | tail -1` },
    { name: '5. Raw DB query students', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \\DB::table('students')->count();" 2>/dev/null | tail -1` },
    { name: '6. Check Filament auth', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -A5 "canAccessPanel\\|canAccess" app/Models/User.php 2>/dev/null | head -15` },
    { name: '7. Check ProgramResource', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -A10 "getEloquentQuery" app/Filament/Resources/ProgramResource.php 2>/dev/null || echo "No custom query"` },
    { name: '8. Check GradeResource', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -A10 "getEloquentQuery" app/Filament/Resources/GradeResource.php 2>/dev/null || echo "No custom query"` },
    { name: '9. Check database connection in .env', cmd: `cd /home/sisvertexunivers/laravel-backend && grep "DB_DATABASE\\|DB_HOST" .env` },
    { name: '10. Test Filament table query', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="
      \\$resource = new \\App\\Filament\\Resources\\StudentResource();
      \\$query = \\$resource::getEloquentQuery();
      echo 'Query count: ' . \\$query->count();
    " 2>/dev/null | tail -1` },
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
