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

  const cmd = `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="\\$plans = App\\\\Models\\\\PaymentPlan::with('student')->take(5)->get(); foreach(\\$plans as \\$p) { \\$name = \\$p->student->full_name_en ?? \\$p->student->name_en ?? \\$p->student->name_ar ?? 'N/A'; \\$number = \\$p->student->student_id ?? 'N/A'; echo \\$p->plan_number . ' - ' . \\$name . ' (' . \\$number . ')' . PHP_EOL; }"`;

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
