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
  console.log('=== System Health Check ===\n');

  const checks = [
    { name: '1. Laravel Error Logs (Last 50 lines)', cmd: `tail -50 /home/sisvertexunivers/laravel-backend/storage/logs/laravel.log 2>/dev/null | grep -E "ERROR|Exception|Fatal" | tail -20` },
    { name: '2. PHP Errors', cmd: `tail -30 /home/sisvertexunivers/logs/error.log 2>/dev/null | tail -20` },
    { name: '3. Database Tables Check', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(['students' => \DB::table('students')->count(), 'users' => \DB::table('users')->count(), 'courses' => \DB::table('courses')->count(), 'enrollments' => \DB::table('enrollments')->count(), 'grades' => \DB::table('grades')->count(), 'semesters' => \DB::table('semesters')->count()]);" 2>/dev/null | tail -1` },
    { name: '4. Check for NULL critical fields', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(['students_no_user' => \DB::table('students')->whereNull('user_id')->count(), 'students_no_email' => \DB::table('students')->whereNull('university_email')->count(), 'enrollments_no_semester' => \DB::table('enrollments')->whereNull('semester_id')->count()]);" 2>/dev/null | tail -1` },
    { name: '5. API Health Check', cmd: `curl -s -o /dev/null -w "%{http_code}" "https://sisvertexunivers.com/api/health" 2>/dev/null || echo "No health endpoint"` },
    { name: '6. Frontend Check', cmd: `curl -s -o /dev/null -w "%{http_code}" "https://sisvertexunivers.com/sis/" 2>/dev/null` },
    { name: '7. Storage Permissions', cmd: `ls -la /home/sisvertexunivers/laravel-backend/storage/logs/ 2>/dev/null | head -5` },
    { name: '8. .env file check', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -E "^(APP_DEBUG|APP_ENV|MOODLE_)" .env 2>/dev/null` },
    { name: '9. Check pending migrations', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan migrate:status 2>/dev/null | grep -E "No|Pending" | head -10` },
    { name: '10. Disk Space', cmd: `df -h /home/sisvertexunivers 2>/dev/null | tail -1` },
  ];

  let i = 0;

  function runNext() {
    if (i >= checks.length) {
      client.end();
      return;
    }

    const { name, cmd } = checks[i];
    console.log(`\n${name}:`);
    console.log('-'.repeat(60));

    client.exec(cmd, (err, stream) => {
      if (err) {
        console.error('Error:', err.message);
        i++;
        runNext();
        return;
      }

      let output = '';
      stream.on('data', (data) => {
        output += data.toString();
      });

      stream.on('close', () => {
        if (output.trim()) {
          try {
            const json = JSON.parse(output.trim());
            console.log(JSON.stringify(json, null, 2));
          } catch {
            console.log(output.trim());
          }
        } else {
          console.log('(No output / OK)');
        }
        i++;
        runNext();
      });
    });
  }

  runNext();
});

client.on('error', (err) => {
  console.error('Connection error:', err.message);
});

client.connect(config);
