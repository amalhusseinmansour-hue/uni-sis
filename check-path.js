import { Client } from 'ssh2';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
};

const conn = new Client();

conn.on('ready', () => {
  console.log('Connected. Checking paths...\n');

  conn.exec('ls -la /home/sisvertexunivers/', (err, stream) => {
    if (err) {
      console.error('Error:', err.message);
      conn.end();
      return;
    }

    stream.on('close', () => {
      conn.exec('ls -la /home/sisvertexunivers/sis.vertexuniversity.edu.eu/ 2>/dev/null || echo "Path not found"', (err2, stream2) => {
        if (err2) {
          console.error('Error:', err2.message);
          conn.end();
          return;
        }

        stream2.on('close', () => {
          conn.end();
        }).on('data', (data) => {
          console.log('\nLaravel path contents:\n', data.toString());
        }).stderr.on('data', (data) => {
          console.error(data.toString());
        });
      });
    }).on('data', (data) => {
      console.log('Home directory:\n', data.toString());
    }).stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
}).on('error', (err) => {
  console.error('Connection error:', err.message);
}).connect(config);
