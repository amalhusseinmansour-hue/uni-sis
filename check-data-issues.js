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
  console.log('=== Data Integrity Check ===\n');

  const checks = [
    { name: '1. Students without program', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \DB::table('students')->whereNull('program_id')->count();" 2>/dev/null | tail -1` },
    { name: '2. Enrollments without valid student', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \DB::table('enrollments')->leftJoin('students','enrollments.student_id','=','students.id')->whereNull('students.id')->count();" 2>/dev/null | tail -1` },
    { name: '3. Grades without enrollment', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \DB::table('grades')->leftJoin('enrollments','grades.enrollment_id','=','enrollments.id')->whereNull('enrollments.id')->count();" 2>/dev/null | tail -1` },
    { name: '4. Users without matching student', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \DB::table('users')->where('role','STUDENT')->leftJoin('students','users.id','=','students.user_id')->whereNull('students.id')->count();" 2>/dev/null | tail -1` },
    { name: '5. Duplicate student IDs', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\DB::table('students')->select('student_id',\DB::raw('count(*) as cnt'))->groupBy('student_id')->having('cnt','>',1)->get());" 2>/dev/null | tail -1` },
    { name: '6. Students with status issues', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\DB::table('students')->select('status',\DB::raw('count(*) as cnt'))->groupBy('status')->get());" 2>/dev/null | tail -1` },
    { name: '7. Empty grades (total=0)', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \DB::table('grades')->where('total',0)->count();" 2>/dev/null | tail -1` },
    { name: '8. Courses without code', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \DB::table('courses')->whereNull('code')->orWhere('code','')->count();" 2>/dev/null | tail -1` },
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
          console.log('  ', JSON.stringify(json, null, 2).substring(0, 500));
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
