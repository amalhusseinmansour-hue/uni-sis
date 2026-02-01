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
  console.log('=== Checking GradingScale Model & Table ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. GradingScale Model:" && \
    cat app/Models/GradingScale.php && \
    echo "" && \
    echo "2. Grading scales in DB:" && \
    php artisan tinker --execute="echo \DB::table('grading_scales')->count();" 2>/dev/null | tail -1 && \
    echo "" && \
    echo "3. Table structure:" && \
    php artisan tinker --execute="print_r(\Schema::getColumnListing('grading_scales'));" 2>/dev/null | tail -20`;

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
