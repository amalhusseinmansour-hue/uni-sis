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
  console.log('=== Checking Grades Status ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. Grade statuses in database:" && \
    php artisan tinker --execute="\DB::table('grades')->selectRaw('status, count(*) as cnt')->groupBy('status')->get()->each(function(\$r){echo \$r->status . ': ' . \$r->cnt . '\n';});" 2>/dev/null | tail -10 && \
    echo "" && \
    echo "2. Sample grades with scores:" && \
    php artisan tinker --execute="\DB::table('grades')->where('total', '>', 0)->select('student_id', 'total', 'grade', 'status')->limit(5)->get()->each(function(\$r){echo 'Student ' . \$r->student_id . ': ' . \$r->total . ' (' . \$r->grade . ') - ' . \$r->status . '\n';});" 2>/dev/null | tail -10`;

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
