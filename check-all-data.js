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
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║     Checking All Database Data               ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  const checks = [
    { name: '1. Students', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo 'Count: ' . \\DB::table('students')->count();" 2>/dev/null | tail -1` },
    { name: '2. Users', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\\DB::table('users')->select('role', \\DB::raw('count(*) as cnt'))->groupBy('role')->get());" 2>/dev/null | tail -1` },
    { name: '3. Programs', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo 'Count: ' . \\DB::table('programs')->count();" 2>/dev/null | tail -1` },
    { name: '4. Courses', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo 'Count: ' . \\DB::table('courses')->count();" 2>/dev/null | tail -1` },
    { name: '5. Semesters', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\\DB::table('semesters')->select('id','name_en','is_active')->get());" 2>/dev/null | tail -1` },
    { name: '6. Enrollments', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo 'Count: ' . \\DB::table('enrollments')->count();" 2>/dev/null | tail -1` },
    { name: '7. Grades', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo 'Count: ' . \\DB::table('grades')->count() . ', With scores: ' . \\DB::table('grades')->where('total', '>', 0)->count();" 2>/dev/null | tail -1` },
    { name: '8. Sample Students', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\\DB::table('students')->join('users','students.user_id','=','users.id')->select('students.id','students.student_id','users.name','users.email')->limit(5)->get());" 2>/dev/null | tail -1` },
    { name: '9. Sample Programs', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\\DB::table('programs')->select('id','code','name_en')->limit(5)->get());" 2>/dev/null | tail -1` },
    { name: '10. Sample Courses', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\\DB::table('courses')->select('id','code','name_en')->limit(5)->get());" 2>/dev/null | tail -1` },
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
