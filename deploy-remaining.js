import { Client } from 'ssh2';
import fs from 'fs';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
};

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH Connection established');

  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      return;
    }

    const files = [
      { local: 'C:/Users/HP/Desktop/projects/sis/dist/assets/attendance-BuWTM0ah.js', remote: '/home/sisvertexunivers/public_html/assets/attendance-BuWTM0ah.js' },
      { local: 'C:/Users/HP/Desktop/projects/sis/dist/assets/html2canvas.esm-QH1iLAAe.js', remote: '/home/sisvertexunivers/public_html/assets/html2canvas.esm-QH1iLAAe.js' },
    ];

    let uploaded = 0;
    const uploadNext = () => {
      if (uploaded >= files.length) {
        console.log('\nRemaining files uploaded!');
        conn.end();
        return;
      }

      const file = files[uploaded];
      console.log(`Uploading: ${file.local.split('/').pop()}`);

      const content = fs.readFileSync(file.local);
      sftp.writeFile(file.remote, content, (err) => {
        if (err) {
          console.error(`Error: ${err.message}`);
        } else {
          console.log(`Done: ${file.local.split('/').pop()}`);
        }
        uploaded++;
        uploadNext();
      });
    };

    uploadNext();
  });
}).on('error', (err) => {
  console.error('SSH Connection error:', err.message);
}).connect(config);
