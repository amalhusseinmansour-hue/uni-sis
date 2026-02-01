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
  console.log('=== API Endpoints Test ===\n');

  const endpoints = [
    { name: 'Main API', url: 'https://sisvertexunivers.com/api' },
    { name: 'Moodle Status', url: 'https://sisvertexunivers.com/api/moodle/status' },
    { name: 'Public Calendar', url: 'https://sisvertexunivers.com/api/academic-calendar/public' },
    { name: 'Announcements', url: 'https://sisvertexunivers.com/api/announcements/public' },
    { name: 'Frontend HTML', url: 'https://sisvertexunivers.com/sis/' },
    { name: 'Frontend JS', url: 'https://sisvertexunivers.com/sis/assets/index-DOVa0zax.js' },
  ];

  let i = 0;

  function runNext() {
    if (i >= endpoints.length) {
      client.end();
      return;
    }

    const { name, url } = endpoints[i];
    const cmd = `curl -s -o /dev/null -w "%{http_code}|%{size_download}" "${url}" 2>/dev/null`;

    client.exec(cmd, (err, stream) => {
      if (err) {
        console.log(`${name}: ERROR - ${err.message}`);
        i++;
        runNext();
        return;
      }

      let output = '';
      stream.on('data', (data) => {
        output += data.toString();
      });

      stream.on('close', () => {
        const [code, size] = output.trim().split('|');
        const status = code === '200' ? '✓' : '✗';
        console.log(`${status} ${name}: HTTP ${code} (${size} bytes)`);
        i++;
        runNext();
      });
    });
  }

  runNext();
});

client.on('error', (err) => {
  console.error('Connection error:', err.message);
});

client.connect(config);
