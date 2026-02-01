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
  console.log('=== Checking Grades Table Structure ===\n');

  client.exec(`cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\\DB::select('DESCRIBE grades'));" 2>/dev/null | tail -1`, (err, stream) => {
    if (err) {
      console.log('Error:', err.message);
      client.end();
      return;
    }

    let output = '';
    stream.on('data', (data) => {
      output += data.toString();
    });

    stream.on('close', () => {
      try {
        const json = JSON.parse(output.trim());
        console.log('Columns:');
        json.forEach(col => {
          console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
        });
      } catch {
        console.log(output);
      }
      client.end();
    });
  });
});

client.connect(config);
