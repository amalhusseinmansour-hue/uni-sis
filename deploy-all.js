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

// Get all files recursively
function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

const allFiles = getAllFiles(distPath);
console.log(`Total files to upload: ${allFiles.length}`);

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH Connection established');

  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      return;
    }

    let index = 0;

    const uploadNext = () => {
      if (index >= allFiles.length) {
        console.log('\n\nAll files uploaded successfully!');
        conn.end();
        return;
      }

      const localFile = allFiles[index];
      const relativePath = path.relative(distPath, localFile).replace(/\\/g, '/');
      const remoteFile = `${remotePath}/${relativePath}`;
      const remoteDir = path.dirname(remoteFile).replace(/\\/g, '/');

      // Create directory and upload file
      conn.exec(`mkdir -p "${remoteDir}"`, (err, stream) => {
        stream.on('close', () => {
          const content = fs.readFileSync(localFile);
          sftp.writeFile(remoteFile, content, (err) => {
            index++;
            process.stdout.write(`\rUploaded: ${index}/${allFiles.length} - ${relativePath.substring(0, 50).padEnd(50)}`);
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
