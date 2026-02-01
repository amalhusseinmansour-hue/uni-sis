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
  console.log('=== Checking ReportController academicSummary ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. ReportController methods:" && \
    grep -n "function" app/Http/Controllers/Api/ReportController.php | head -20 && \
    echo "" && \
    echo "2. academicSummary method:" && \
    sed -n '/public function academicSummary/,/^    public function/p' app/Http/Controllers/Api/ReportController.php | head -80`;

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
