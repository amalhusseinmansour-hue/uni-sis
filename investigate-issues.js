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
  console.log('=== Investigating Issues ===\n');

  const checks = [
    { name: '1. Users without student records (details)', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\DB::table('users')->where('role','STUDENT')->leftJoin('students','users.id','=','students.user_id')->whereNull('students.id')->select('users.id','users.name','users.email','users.created_at')->take(10)->get());" 2>/dev/null | tail -1` },
    { name: '2. Check if these are test/old users', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \DB::table('users')->where('role','STUDENT')->leftJoin('students','users.id','=','students.user_id')->whereNull('students.id')->where('users.email','like','%test%')->count();" 2>/dev/null | tail -1` },
    { name: '3. Grades with 0 by semester', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\DB::table('grades')->join('semesters','grades.semester_id','=','semesters.id')->where('total',0)->select('semesters.name_en',\DB::raw('count(*) as cnt'))->groupBy('semesters.id','semesters.name_en')->get());" 2>/dev/null | tail -1` },
    { name: '4. Check enrollments without grades', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \DB::table('enrollments')->leftJoin('grades','enrollments.id','=','grades.enrollment_id')->whereNull('grades.id')->count();" 2>/dev/null | tail -1` },
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
