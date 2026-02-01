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
  console.log('=== Checking Current Grades Data ===\n');

  const checks = [
    { name: '1. Total grades', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo 'Total: ' . \\DB::table('grades')->count() . ', With scores: ' . \\DB::table('grades')->where('total', '>', 0)->count();" 2>/dev/null | tail -1` },
    { name: '2. Grades by semester', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\\DB::table('grades')->join('semesters','grades.semester_id','=','semesters.id')->select('semesters.name_en',\\DB::raw('count(*) as total'),\\DB::raw('sum(case when grades.total > 0 then 1 else 0 end) as with_scores'))->groupBy('semesters.id','semesters.name_en')->get());" 2>/dev/null | tail -1` },
    { name: '3. Sample grades with scores', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\\DB::table('grades')->join('enrollments','grades.enrollment_id','=','enrollments.id')->join('students','enrollments.student_id','=','students.id')->join('courses','enrollments.course_id','=','courses.id')->join('users','students.user_id','=','users.id')->where('grades.total','>',0)->select('users.name','courses.code','grades.total','grades.grade')->limit(10)->get());" 2>/dev/null | tail -1` },
    { name: '4. Grade distribution', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\\DB::table('grades')->where('total','>',0)->select('grade',\\DB::raw('count(*) as cnt'))->groupBy('grade')->orderByDesc('cnt')->get());" 2>/dev/null | tail -1` },
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
