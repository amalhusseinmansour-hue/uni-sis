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
\\$student = \\\\App\\\\Models\\\\Student::find(13);
echo 'Student ID 13 details:\\n';
echo 'full_name_en: ' . (\\$student->full_name_en ?? 'NULL') . '\\n';
echo 'name: ' . (\\$student->name ?? 'NULL') . '\\n';
echo 'first_name_en: ' . (\\$student->first_name_en ?? 'NULL') . '\\n';
echo 'last_name_en: ' . (\\$student->last_name_en ?? 'NULL') . '\\n';
echo 'user_id: ' . \\$student->user_id . '\\n';
echo '\\nPayment Plan for student 13:\\n';
\\$plan = \\\\App\\\\Models\\\\PaymentPlan::where('student_id', 13)->with('installments')->first();
if(\\$plan) {
  echo 'Plan: ' . \\$plan->plan_number . '\\n';
  echo 'Total: ' . \\$plan->total_amount . '\\n';
  echo 'Status: ' . \\$plan->status . '\\n';
  echo 'Installments: ' . \\$plan->installments->count() . '\\n';
} else {
  echo 'No plan found\\n';
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
