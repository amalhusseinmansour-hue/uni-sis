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
  console.log('Running grade import...\n');

  // Call the import all grades API
  const cmd = `curl -s -X POST "https://sisvertexunivers.com/api/moodle/import/all-grades" -H "Accept: application/json" -H "Content-Type: application/json" 2>/dev/null`;
  
  client.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Error:', err.message);
      client.end();
      return;
    }

    let output = '';
    stream.on('data', (data) => {
      output += data.toString();
    });

    stream.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    stream.on('close', () => {
      try {
        const json = JSON.parse(output);
        console.log('Result:');
        console.log(JSON.stringify(json, null, 2));
      } catch {
        console.log(output);
      }
      client.end();
    });
  });
});

client.on('error', (err) => {
  console.error('Connection error:', err.message);
});

client.connect(config);
