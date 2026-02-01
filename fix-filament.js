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
  console.log('=== Fixing Filament Admin Panel ===\n');

  const commands = [
    'cd /home/sisvertexunivers/laravel-backend',
    'php artisan cache:clear',
    'php artisan config:clear',
    'php artisan view:clear',
    'php artisan route:clear',
    'php artisan filament:clear-cached-components 2>/dev/null || echo "No clear cache command"',
    'php artisan filament:cache-components',
    'php artisan optimize:clear',
    'php artisan icons:clear 2>/dev/null || echo "No icons clear"',
    'php artisan icons:cache 2>/dev/null || echo "No icons cache"',
    'echo ""',
    'echo "=== Verifying Data Access ==="',
    'php artisan tinker --execute="echo \'Students: \' . \\App\\Models\\Student::count();" 2>/dev/null | tail -1',
    'php artisan tinker --execute="echo \'Programs: \' . \\App\\Models\\Program::count();" 2>/dev/null | tail -1',
    'php artisan tinker --execute="echo \'Courses: \' . \\App\\Models\\Course::count();" 2>/dev/null | tail -1',
    'php artisan tinker --execute="echo \'Grades: \' . \\App\\Models\\Grade::count();" 2>/dev/null | tail -1',
    'php artisan tinker --execute="echo \'Semesters: \' . \\App\\Models\\Semester::count();" 2>/dev/null | tail -1',
  ];

  const cmd = commands.join(' && ');

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
      console.log('\n\n=== Done! Try refreshing the admin panel ===');
      console.log('URL: https://sis.vertexuniversity.edu.eu/admin');
      client.end();
    });
  });
});

client.connect(config);
