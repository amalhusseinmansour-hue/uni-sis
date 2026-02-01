import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
};

const filesToUpload = [];
const distPath = 'C:/Users/HP/Desktop/projects/sis/dist';
const remotePath = '/home/sisvertexunivers/public_html';

// Get all files from dist
function getFiles(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getFiles(fullPath, baseDir);
    } else {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      filesToUpload.push({
        local: fullPath,
        remote: `${remotePath}/${relativePath}`,
      });
    }
  }
}

getFiles(distPath);

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH Connection established');
  console.log(`Files to upload: ${filesToUpload.length}`);

  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      return;
    }

    let uploaded = 0;
    const uploadNext = () => {
      if (uploaded >= filesToUpload.length) {
        console.log('\nAll files uploaded successfully!');
        conn.end();
        return;
      }

      const file = filesToUpload[uploaded];
      const remoteDir = path.dirname(file.remote).replace(/\\/g, '/');

      // Ensure directory exists
      conn.exec(`mkdir -p "${remoteDir}"`, (err, stream) => {
        if (err) {
          console.error('mkdir error:', err);
          uploaded++;
          uploadNext();
          return;
        }

        stream.on('close', () => {
          const content = fs.readFileSync(file.local);
          sftp.writeFile(file.remote, content, (err) => {
            if (err) {
              console.error(`Error uploading ${file.remote}:`, err.message);
            } else {
              process.stdout.write(`\rUploaded: ${uploaded + 1}/${filesToUpload.length}`);
            }
            uploaded++;
            uploadNext();
          });
        });
      });
    };

    uploadNext();
  });
}).on('error', (err) => {
  console.error('SSH Connection error:', err.message);
}).connect(config);
