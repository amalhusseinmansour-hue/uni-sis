import { Client } from 'ssh2';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
};

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH Connection established');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="
\\$plans = \\\\App\\\\Models\\\\PaymentPlan::with('student')->get();
echo 'Payment Plans with Students:\\n';
foreach(\\$plans as \\$p) {
  echo \\$p->plan_number . ' - Student: ' . (\\$p->student->full_name_en ?? 'N/A') . ' (ID: ' . \\$p->student_id . ')\\n';
}
echo '\\nStudents with Users (for login):\\n';
\\$studentsWithUsers = \\\\App\\\\Models\\\\Student::whereHas('user')->limit(5)->get();
foreach(\\$studentsWithUsers as \\$s) {
  echo \\$s->id . ' - ' . (\\$s->full_name_en ?? \\$s->name ?? 'N/A') . ' - User: ' . \\$s->user->email . '\\n';
}
"`;

  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Exec error:', err);
      conn.end();
      return;
    }

    stream.on('close', (code) => {
      console.log('\nCommand completed with code:', code);
      conn.end();
    }).on('data', (data) => {
      console.log(data.toString());
    }).stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
}).on('error', (err) => {
  console.error('SSH Connection error:', err.message);
}).connect(config);
