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

    // Upload main files
    const files = [
      { local: 'C:/Users/HP/Desktop/projects/sis/dist/index.html', remote: '/home/sisvertexunivers/public_html/index.html' },
      { local: 'C:/Users/HP/Desktop/projects/sis/dist/assets/index-Dwo6qtpu.js', remote: '/home/sisvertexunivers/public_html/assets/index-Dwo6qtpu.js' },
      { local: 'C:/Users/HP/Desktop/projects/sis/dist/assets/index-B1-UM3tk.css', remote: '/home/sisvertexunivers/public_html/assets/index-B1-UM3tk.css' },
    ];

    let uploaded = 0;
    const uploadNext = () => {
      if (uploaded >= files.length) {
        console.log('\nMain files uploaded!');
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
