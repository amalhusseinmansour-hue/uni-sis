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
  console.log('=== Checking Student My Routes ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. All /my routes:" && \
    grep -n "my" routes/api.php && \
    echo "" && \
    echo "2. Student-only routes section:" && \
    cat routes/api.php | grep -A 40 "STUDENT ONLY ROUTES" | head -50 && \
    echo "" && \
    echo "3. Count grades in database with actual scores:" && \
    php artisan tinker --execute="echo 'Total grades: ' . \DB::table('grades')->count() . ', With scores: ' . \DB::table('grades')->where('total', '>', 0)->count();" 2>/dev/null | tail -1`;

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
