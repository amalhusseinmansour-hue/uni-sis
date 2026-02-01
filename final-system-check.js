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
  console.log('║       FINAL SYSTEM HEALTH CHECK              ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  const checks = [
    { name: '1. Users by Role', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\\DB::table('users')->select('role',\\DB::raw('count(*) as cnt'))->groupBy('role')->orderByDesc('cnt')->get());" 2>/dev/null | tail -1` },
    { name: '2. Students with valid user accounts', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo 'Valid: ' . \\DB::table('students')->whereNotNull('user_id')->count() . ', Invalid: ' . \\DB::table('students')->whereNull('user_id')->count();" 2>/dev/null | tail -1` },
    { name: '3. Orphan STUDENT users (should be 0)', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \\DB::table('users')->where('role','STUDENT')->leftJoin('students','users.id','=','students.user_id')->whereNull('students.id')->count();" 2>/dev/null | tail -1` },
    { name: '4. Enrollments count', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo 'Total: ' . \\DB::table('enrollments')->count();" 2>/dev/null | tail -1` },
    { name: '5. Grades count', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo 'Total: ' . \\DB::table('grades')->count() . ', With scores: ' . \\DB::table('grades')->where('total', '>', 0)->count();" 2>/dev/null | tail -1` },
    { name: '6. Grades by Semester', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\\DB::table('grades')->join('semesters','grades.semester_id','=','semesters.id')->select('semesters.name_en',\\DB::raw('count(*) as total'),\\DB::raw('sum(case when total > 0 then 1 else 0 end) as with_scores'))->groupBy('semesters.id','semesters.name_en')->get());" 2>/dev/null | tail -1` },
    { name: '7. Students by Status', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\\DB::table('students')->select('status',\\DB::raw('count(*) as cnt'))->groupBy('status')->get());" 2>/dev/null | tail -1` },
    { name: '8. Programs count', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \\DB::table('programs')->count();" 2>/dev/null | tail -1` },
    { name: '9. Courses count', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \\DB::table('courses')->count();" 2>/dev/null | tail -1` },
    { name: '10. Active Semesters', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\\DB::table('semesters')->select('name_en','is_active','start_date','end_date')->orderByDesc('start_date')->limit(3)->get());" 2>/dev/null | tail -1` },
  ];

  let i = 0;

  function runNext() {
    if (i >= checks.length) {
      console.log('\n╔══════════════════════════════════════════════╗');
      console.log('║       SYSTEM CHECK COMPLETE ✓                ║');
      console.log('╚══════════════════════════════════════════════╝');
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
