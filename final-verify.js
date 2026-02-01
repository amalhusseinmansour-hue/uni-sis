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
echo 'Payment Plans: ' . \\\\App\\\\Models\\\\PaymentPlan::count();
echo ' | Installments: ' . \\\\App\\\\Models\\\\PaymentPlanInstallment::count();
echo ' | Scholarships: ' . \\\\App\\\\Models\\\\Scholarship::count();
echo ' | Student Scholarships: ' . \\\\App\\\\Models\\\\StudentScholarship::count();
echo ' | Fee Structures: ' . \\\\App\\\\Models\\\\FeeStructure::count();
echo ' | Students: ' . \\\\App\\\\Models\\\\Student::count();
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
