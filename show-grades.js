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
  console.log('=== Checking Grades Data ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="
    echo '=== Grades Summary ===' . PHP_EOL;
    echo 'Total grades: ' . \DB::table('grades')->count() . PHP_EOL;
    echo 'With scores (>0): ' . \DB::table('grades')->where('total', '>', 0)->count() . PHP_EOL;
    echo PHP_EOL . '=== By Semester ===' . PHP_EOL;
    \$bySem = \DB::table('grades')
      ->join('semesters', 'grades.semester_id', '=', 'semesters.id')
      ->select('semesters.name_en', \DB::raw('count(*) as cnt'), \DB::raw('sum(case when grades.total > 0 then 1 else 0 end) as with_scores'))
      ->groupBy('semesters.id', 'semesters.name_en')
      ->get();
    foreach(\$bySem as \$s) {
      echo \$s->name_en . ': ' . \$s->cnt . ' grades (' . \$s->with_scores . ' with scores)' . PHP_EOL;
    }
    echo PHP_EOL . '=== Sample Grades with Scores ===' . PHP_EOL;
    \$samples = \DB::table('grades')
      ->join('students', 'grades.student_id', '=', 'students.id')
      ->join('courses', 'grades.course_id', '=', 'courses.id')
      ->where('grades.total', '>', 0)
      ->select('students.name_en as student', 'courses.code', 'grades.total', 'grades.grade')
      ->limit(10)
      ->get();
    foreach(\$samples as \$g) {
      echo \$g->student . ' - ' . \$g->code . ': ' . \$g->total . ' (' . \$g->grade . ')' . PHP_EOL;
    }
  " 2>/dev/null`;

  client.exec(cmd, (err, stream) => {
    if (err) {
      console.log('Error:', err.message);
      client.end();
      return;
    }

    stream.on('data', (data) => {
      process.stdout.write(data.toString());
    });

    stream.on('close', () => {
      client.end();
    });
  });
});

client.connect(config);
