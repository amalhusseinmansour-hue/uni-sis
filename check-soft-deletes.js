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
  console.log('=== Checking Soft Deleted Records ===\n');

  const checks = [
    { name: '1. Students - active vs deleted', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="
      echo 'Active: ' . \\App\\Models\\Student::count() . ', Deleted: ' . \\App\\Models\\Student::onlyTrashed()->count() . ', All: ' . \\App\\Models\\Student::withTrashed()->count();
    " 2>/dev/null | tail -1` },
    { name: '2. Programs - check table', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="
      \\$hasSoftDelete = \\Schema::hasColumn('programs', 'deleted_at');
      if (\\$hasSoftDelete) {
        echo 'Active: ' . \\App\\Models\\Program::count() . ', Deleted: ' . \\App\\Models\\Program::onlyTrashed()->count();
      } else {
        echo 'No soft delete, Count: ' . \\DB::table('programs')->count();
      }
    " 2>/dev/null | tail -1` },
    { name: '3. Courses - check table', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="
      \\$hasSoftDelete = \\Schema::hasColumn('courses', 'deleted_at');
      if (\\$hasSoftDelete) {
        echo 'Active: ' . \\App\\Models\\Course::count() . ', Deleted: ' . \\App\\Models\\Course::onlyTrashed()->count();
      } else {
        echo 'No soft delete, Count: ' . \\DB::table('courses')->count();
      }
    " 2>/dev/null | tail -1` },
    { name: '4. Check Filament Panels', cmd: `cd /home/sisvertexunivers/laravel-backend && ls -la app/Providers/*Panel* 2>/dev/null || ls -la app/Providers/Filament* 2>/dev/null || echo "Checking AdminPanelProvider..."` },
    { name: '5. Check AdminPanelProvider', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -A5 "public function panel" app/Providers/Filament/AdminPanelProvider.php 2>/dev/null | head -10` },
    { name: '6. Check navigation groups', cmd: `cd /home/sisvertexunivers/laravel-backend && grep "navigationGroup\\|getNavigationGroup" app/Filament/Resources/StudentResource.php 2>/dev/null || echo "No navigation group"` },
    { name: '7. Admin panel URL path', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -E "path\\(|->path" app/Providers/Filament/AdminPanelProvider.php 2>/dev/null || echo "Default path"` },
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
