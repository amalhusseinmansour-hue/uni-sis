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
  console.log('Checking imported grades...\n');

  const commands = [
    { name: '1. Grades with LMS data (total > 0)', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \DB::table('grades')->where('total', '>', 0)->count();" 2>/dev/null | tail -1` },
    { name: '2. Grades by semester', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\DB::table('grades')->join('semesters','grades.semester_id','=','semesters.id')->select('semesters.name_en',\DB::raw('count(*) as count'),\DB::raw('avg(total) as avg_grade'))->where('total','>',0)->groupBy('semesters.id','semesters.name_en')->get());" 2>/dev/null | tail -1` },
    { name: '3. Sample imported grades', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\DB::table('grades')->join('students','grades.student_id','=','students.id')->join('courses','grades.course_id','=','courses.id')->join('semesters','grades.semester_id','=','semesters.id')->select('students.name_en','courses.code','grades.total','grades.grade','semesters.name_en as semester')->where('total','>',0)->orderBy('grades.updated_at','desc')->take(15)->get());" 2>/dev/null | tail -1` },
  ];

  let i = 0;

  function runNext() {
    if (i >= commands.length) {
      client.end();
      return;
    }

    const { name, cmd } = commands[i];
    console.log(`\n${name}:`);
    console.log('-'.repeat(60));

    client.exec(cmd, (err, stream) => {
      if (err) {
        console.error('Error:', err.message);
        i++;
        runNext();
        return;
      }

      stream.on('data', (data) => {
        const output = data.toString().trim();
        try {
          const json = JSON.parse(output);
          console.log(JSON.stringify(json, null, 2).substring(0, 3000));
        } catch {
          console.log(output);
        }
      });

      stream.on('close', () => {
        i++;
        runNext();
      });
    });
  }

  runNext();
});

client.connect(config);
