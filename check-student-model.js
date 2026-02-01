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
  console.log('=== Checking Student Model Boot Method ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    echo "1. Student model boot method:" && \
    sed -n '/protected static function boot/,/^    }/p' app/Models/Student.php | head -30 && \
    echo "" && \
    echo "2. Any global scopes in Student model:" && \
    grep -n "addGlobalScope\\|GlobalScope" app/Models/Student.php || echo "No global scopes" && \
    echo "" && \
    echo "3. StudentResource table method:" && \
    grep -A30 "public static function table" app/Filament/Resources/StudentResource.php | head -35`;

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
