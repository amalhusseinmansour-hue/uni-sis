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
  console.log('Checking connection...\n');

  const commands = [
    { name: 'Curl with verbose', cmd: `curl -v --max-time 10 "https://sisvertexunivers.com/api/moodle/status" 2>&1 | head -30` },
    { name: 'Wget test', cmd: `wget -q -O - --timeout=10 "https://sisvertexunivers.com/sis/" 2>&1 | head -5` },
    { name: 'PHP test', cmd: `php -r "echo file_get_contents('https://sisvertexunivers.com/api/moodle/status');" 2>&1 | head -50` },
    { name: 'Local API test', cmd: `curl -s "http://localhost/api/moodle/status" 2>&1 | head -50` },
  ];

  let i = 0;

  function runNext() {
    if (i >= commands.length) {
      client.end();
      return;
    }

    const { name, cmd } = commands[i];
    console.log(`\n${name}:`);
    console.log('-'.repeat(50));

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
