import Client from 'ssh2-sftp-client';
import fs from 'fs';
import path from 'path';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
};

const localDistPath = 'C:/Users/HP/Desktop/projects/sis/dist';
const remoteBasePath = '/home/sisvertexunivers/public_html';

async function uploadDir(sftp, localDir, remoteDir) {
  const items = fs.readdirSync(localDir);
  
  for (const item of items) {
    const localPath = path.join(localDir, item);
    const remotePath = `${remoteDir}/${item}`;
    const stat = fs.statSync(localPath);
    
    if (stat.isDirectory()) {
      try {
        await sftp.mkdir(remotePath, true);
      } catch (e) { /* ignore */ }
      await uploadDir(sftp, localPath, remotePath);
    } else {
      console.log(`Uploading: ${item}`);
      await sftp.put(localPath, remotePath);
    }
  }
}

async function main() {
  console.log('=== Deploying Frontend ===\n');
  
  const sftp = new Client();
  try {
    await sftp.connect(config);
    
    // Upload index.html
    console.log('Uploading index.html...');
    await sftp.put(`${localDistPath}/index.html`, `${remoteBasePath}/index.html`);
    
    // Upload assets directory
    console.log('\nUploading assets...');
    try {
      await sftp.mkdir(`${remoteBasePath}/assets`, true);
    } catch (e) { /* ignore */ }
    await uploadDir(sftp, `${localDistPath}/assets`, `${remoteBasePath}/assets`);
    
    console.log('\n=== Deployment Complete ===');
    await sftp.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
