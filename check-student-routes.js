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
  console.log('=== Checking Student Routes & API ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. Full routes/api.php for students:" && \
    cat routes/api.php | grep -A 100 "student.access" | head -60 && \
    echo "" && \
    echo "2. getMyProfile method:" && \
    sed -n '/function getMyProfile/,/^    public function/p' app/Http/Controllers/Api/StudentController.php | head -50 && \
    echo "" && \
    echo "3. grades method:" && \
    sed -n '/function grades/,/^    public function/p' app/Http/Controllers/Api/StudentController.php | head -20`;

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
