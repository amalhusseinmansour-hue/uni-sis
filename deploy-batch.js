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

// Priority files to upload (main app files)
const priorityFiles = [
  'index.html',
  'assets/index-Dwo6qtpu.js',
  'assets/index-B1-UM3tk.css',
  'assets/attendance-BuWTM0ah.js',
  'assets/html2canvas.esm-QH1iLAAe.js',
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
      if (index >= priorityFiles.length) {
        console.log('\nDone! All priority files uploaded.');
        conn.end();
        return;
      }

      const relativePath = priorityFiles[index];
      const localFile = path.join(distPath, relativePath);
      const remoteFile = `${remotePath}/${relativePath}`;

      console.log(`[${index + 1}/${priorityFiles.length}] Uploading: ${relativePath}`);

      const content = fs.readFileSync(localFile);

      sftp.writeFile(remoteFile, content, (err) => {
        if (err) {
          console.error(`  Error: ${err.message}`);
        } else {
          console.log(`  Done (${(content.length / 1024).toFixed(1)} KB)`);
        }
        index++;
        setTimeout(uploadFile, 100); // Small delay between uploads
      });
    };

    uploadFile();
  });
}).on('error', (err) => {
  console.error('Connection error:', err.message);
}).connect(config);
