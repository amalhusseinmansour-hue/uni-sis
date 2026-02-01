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
  const cmd = `grep -n "function getLmsStudents\|function importAllGrades\|function getGradesBySemester" /home/sisvertexunivers/laravel-backend/app/Http/Controllers/Api/MoodleSyncController.php 2>/dev/null`;
  
  client.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Error:', err.message);
      client.end();
      return;
    }

    console.log('Methods in MoodleSyncController on server:');
    stream.on('data', (data) => {
      console.log(data.toString());
    });

    stream.on('close', () => {
      client.end();
    });
  });
});

client.connect(config);
