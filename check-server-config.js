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
  console.log('Checking server configuration...\n');

  const commands = [
    { name: '1. Laravel Backend test (artisan)', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan route:list --path=moodle 2>&1 | head -20` },
    { name: '2. Check Laravel .htaccess', cmd: `cat /home/sisvertexunivers/laravel-backend/public/.htaccess 2>/dev/null | head -20` },
    { name: '3. Check backend public index.php', cmd: `ls -la /home/sisvertexunivers/laravel-backend/public/index.php 2>/dev/null` },
    { name: '4. Check Laravel error log (latest)', cmd: `tail -20 /home/sisvertexunivers/laravel-backend/storage/logs/laravel.log 2>/dev/null` },
    { name: '5. Test internal API via PHP', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="\$response = app()->handle(\Illuminate\Http\Request::create('/api/moodle/status', 'GET')); echo \$response->getContent();" 2>/dev/null | tail -5` },
  ];

  let i = 0;

  function runNext() {
    if (i >= commands.length) {
      client.end();
      return;
    }

    const { name, cmd } = commands[i];
    console.log(`\n${name}:`);
    console.log('-'.repeat(60));

    client.exec(cmd, (err, stream) => {
      if (err) {
        console.error('Error:', err.message);
        i++;
        runNext();
        return;
      }

      stream.on('data', (data) => {
        console.log(data.toString());
      });

      stream.on('close', () => {
        i++;
        runNext();
      });
    });
  }

  runNext();
});

client.connect(config);
