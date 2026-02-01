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
  console.log('=== Checking Filament List Pages ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. StudentResource ListStudents page:" && \
    cat app/Filament/Resources/StudentResource/Pages/ListStudents.php && \
    echo "" && \
    echo "2. GradeResource ListGrades page:" && \
    cat app/Filament/Resources/GradeResource/Pages/ListGrades.php 2>/dev/null || echo "File not found"`;

  client.exec(cmd, (err, stream) => {
    if (err) {
      console.log('Error:', err.message);
      client.end();
      return;
    }

    stream.on('data', (data) => {
      process.stdout.write(data.toString());
    });

    stream.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });

    stream.on('close', () => {
      client.end();
    });
  });
});

client.connect(config);
