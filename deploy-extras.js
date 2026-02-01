import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
};

const distPath = 'C:/Users/HP/Desktop/projects/sis/dist';
const remotePath = '/home/sisvertexunivers/public_html';

// Extra files to upload
const extraFiles = [
  '.htaccess',
  'favicon.ico',
  'favicon.svg',
  'manifest.json',
  'robots.txt',
];

const conn = new Client();

conn.on('ready', () => {
  console.log('Connected to server');

  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      return;
    }

    let index = 0;

    const uploadFile = () => {
      if (index >= extraFiles.length) {
        console.log('\nDone!');
        conn.end();
        return;
      }

      const relativePath = extraFiles[index];
      const localFile = path.join(distPath, relativePath);
      const remoteFile = `${remotePath}/${relativePath}`;

      if (!fs.existsSync(localFile)) {
        console.log(`[${index + 1}/${extraFiles.length}] Skipping: ${relativePath} (not found)`);
        index++;
        uploadFile();
        return;
      }

      console.log(`[${index + 1}/${extraFiles.length}] Uploading: ${relativePath}`);

      const content = fs.readFileSync(localFile);

      sftp.writeFile(remoteFile, content, (err) => {
        if (err) {
          console.error(`  Error: ${err.message}`);
        } else {
          console.log(`  Done`);
        }
        index++;
        setTimeout(uploadFile, 100);
      });
    };

    uploadFile();
  });
}).on('error', (err) => {
  console.error('Connection error:', err.message);
}).connect(config);
