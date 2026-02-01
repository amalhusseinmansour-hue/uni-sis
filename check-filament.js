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
  console.log('=== Checking Filament Admin Panel ===\n');

  const checks = [
    { name: '1. Check Filament cache', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan filament:cache-components 2>&1 || echo "No filament cache command"` },
    { name: '2. Clear all caches', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan cache:clear && php artisan config:clear && php artisan view:clear && php artisan route:clear 2>&1` },
    { name: '3. Check admin users', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\\DB::table('users')->whereIn('role', ['ADMIN'])->select('id','name','email','role')->get());" 2>/dev/null | tail -1` },
    { name: '4. Check Filament resources exist', cmd: `ls -la /home/sisvertexunivers/laravel-backend/app/Filament/Resources/ 2>&1 | head -20` },
    { name: '5. Check semesters table', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\\DB::table('semesters')->get());" 2>/dev/null | tail -1` },
    { name: '6. Check .env APP_URL', cmd: `cd /home/sisvertexunivers/laravel-backend && grep APP_URL .env` },
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
