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
  console.log('Connected! Testing Moodle API...\n');

  const commands = [
    // Test Moodle connection
    `curl -s -X POST "https://lms.vertexuniversity.edu.eu/webservice/rest/server.php" -d "wstoken=ded9ef944fafa577f247fd38540b5ae5&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json" 2>/dev/null | head -500`,
  ];

  let i = 0;

  function runNext() {
    if (i >= commands.length) {
      client.end();
      return;
    }

    client.exec(commands[i], (err, stream) => {
      if (err) {
        console.error('Error:', err.message);
        i++;
        runNext();
        return;
      }

      stream.on('data', (data) => {
        console.log(data.toString());
      });

      stream.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      stream.on('close', () => {
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
