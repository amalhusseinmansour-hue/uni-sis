import { Client } from 'ssh2';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
};

const commands = [
  'cd /home/sisvertexunivers/laravel-backend',
  'php artisan db:seed --class=ScholarshipSeeder --force',
  'php artisan cache:clear',
];

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH Connection established');

  conn.exec(commands.join(' && '), (err, stream) => {
    if (err) {
      console.error('Exec error:', err);
      conn.end();
      return;
    }

    stream.on('close', (code) => {
      console.log('\nCommand completed with code:', code);
      conn.end();
    }).on('data', (data) => {
      console.log(data.toString());
    }).stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
}).on('error', (err) => {
  console.error('SSH Connection error:', err.message);
}).connect(config);
