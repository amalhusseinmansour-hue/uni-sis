import { Client } from 'ssh2';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
};

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH Connection established');

  const cmd = `curl -s http://localhost:8000/api/payment-plans 2>/dev/null | head -500`;

  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Exec error:', err);
      conn.end();
      return;
    }

    stream.on('close', (code) => {
      console.log('\nCommand completed with code:', code);
      conn.end();
    }).on('data', (data) => {
      try {
        const json = JSON.parse(data.toString());
        console.log('API Response (first 2 plans):');
        json.slice(0, 2).forEach(plan => {
          console.log(`- ${plan.id}: ${plan.student_name} (${plan.student_number})`);
        });
      } catch (e) {
        console.log(data.toString().substring(0, 500));
      }
    }).stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
}).on('error', (err) => {
  console.error('SSH Connection error:', err.message);
}).connect(config);
