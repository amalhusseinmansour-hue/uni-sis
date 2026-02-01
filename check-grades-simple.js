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
  console.log('Checking grades in database...\n');

  const commands = [
    { name: '1. Check moodle_grades table', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \DB::table('moodle_grades')->count();" 2>/dev/null | tail -1` },
    { name: '2. Check grades table', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \DB::table('grades')->count();" 2>/dev/null | tail -1` },
    { name: '3. Sample grades', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\DB::table('grades')->join('students','grades.student_id','=','students.id')->join('courses','grades.course_id','=','courses.id')->select('students.name_en','courses.code','grades.total','grades.grade')->take(10)->get());" 2>/dev/null | tail -1` },
  ];

  let i = 0;

  function runNext() {
    if (i >= commands.length) {
      client.end();
      return;
    }

    const { name, cmd } = commands[i];
    console.log(`\n${name}:`);
    console.log('-'.repeat(50));

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
          console.log(JSON.stringify(json, null, 2).substring(0, 2000));
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

client.on('error', (err) => {
  console.error('Connection error:', err.message);
});

client.connect(config);
