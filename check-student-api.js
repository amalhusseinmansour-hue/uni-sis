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
  console.log('=== Checking Student API Controller ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. StudentController methods:" && \
    grep -n "function" app/Http/Controllers/Api/StudentController.php | head -30 && \
    echo "" && \
    echo "2. getMyAcademicSummary method:" && \
    sed -n '/function getMyAcademicSummary/,/^    public function/p' app/Http/Controllers/Api/StudentController.php | head -80 && \
    echo "" && \
    echo "3. Student routes:" && \
    grep -A2 "student" routes/api.php | head -30`;

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
