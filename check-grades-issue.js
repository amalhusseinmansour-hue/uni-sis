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
  console.log('=== Checking Grades Issue ===\n');

  const checks = [
    { name: '1. Raw grades count', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \\DB::table('grades')->count();" 2>/dev/null | tail -1` },
    { name: '2. Grade model count', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \\App\\Models\\Grade::count();" 2>/dev/null | tail -1` },
    { name: '3. Grade model with trashed', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \\App\\Models\\Grade::withTrashed()->count();" 2>/dev/null | tail -1` },
    { name: '4. Check Grade model for soft deletes', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -n "SoftDeletes" app/Models/Grade.php 2>/dev/null || echo "No soft deletes"` },
    { name: '5. Check Grade model boot method', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -A20 "protected static function boot" app/Models/Grade.php 2>/dev/null || echo "No boot method"` },
    { name: '6. Check GradeResource getEloquentQuery', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -A15 "getEloquentQuery" app/Filament/Resources/GradeResource.php 2>/dev/null || echo "No custom query"` },
    { name: '7. Sample grades from DB', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\\DB::table('grades')->select('id','student_id','course_id','total','grade')->limit(5)->get());" 2>/dev/null | tail -1` },
    { name: '8. Check is_active column in grades', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \\Schema::hasColumn('grades', 'is_active') ? 'YES' : 'NO';" 2>/dev/null | tail -1` },
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

      stream.on('close', () => {
        const result = output.trim();
        try {
          const json = JSON.parse(result);
          console.log(JSON.stringify(json, null, 2));
        } catch {
          console.log('  ', result);
        }
        console.log('');
        i++;
        runNext();
      });
    });
  }

  runNext();
});

client.connect(config);
