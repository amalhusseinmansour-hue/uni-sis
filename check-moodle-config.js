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
  console.log('=== Checking Moodle Configuration ===\n');

  const checks = [
    { name: '1. Check .env for Moodle settings', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -i moodle .env 2>/dev/null || echo "No Moodle settings in .env"` },
    { name: '2. Check config files', cmd: `cd /home/sisvertexunivers/laravel-backend && cat config/services.php 2>/dev/null | grep -A5 -i moodle || echo "No moodle config"` },
    { name: '3. Check MoodleIntegrationService', cmd: `cd /home/sisvertexunivers/laravel-backend && grep -E "moodleUrl|baseUrl|lms" app/Services/MoodleIntegrationService.php 2>/dev/null | head -5` },
    { name: '4. Try curl to vertex domains', cmd: `curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://vertex.edu 2>/dev/null || echo "Failed"` },
    { name: '5. Check /etc/hosts', cmd: `cat /etc/hosts | grep -i lms || echo "No LMS entry in hosts"` },
  ];

  let i = 0;

  function runNext() {
    if (i >= checks.length) {
      client.end();
      return;
    }

    const { name, cmd } = checks[i];
    console.log(`${name}:`);

    client.exec(cmd, (err, stream) => {
      if (err) {
        console.log('  ERROR:', err.message);
        i++;
        runNext();
        return;
      }

      let output = '';
      stream.on('data', (data) => {
        output += data.toString();
      });

      stream.stderr.on('data', (data) => {
        output += data.toString();
      });

      stream.on('close', () => {
        console.log('  ', output.trim() || '(empty)');
        console.log('');
        i++;
        runNext();
      });
    });
  }

  runNext();
});

client.connect(config);
