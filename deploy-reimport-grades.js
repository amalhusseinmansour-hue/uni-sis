import Client from 'ssh2-sftp-client';
import { Client as SSHClient } from 'ssh2';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
};

async function main() {
  console.log('=== Re-importing LMS Grades ===\n');

  const sftp = new Client();
  try {
    console.log('1. Uploading script...');
    await sftp.connect(config);
    await sftp.put('C:/Users/HP/Desktop/projects/sis/dist/reimport-lms-grades.php', '/home/sisvertexunivers/public_html/reimport-lms-grades.php');
    console.log('   Done\n');
    await sftp.end();
  } catch (err) {
    console.log('SFTP Error:', err.message);
    await sftp.end();
    return;
  }

  console.log('2. Executing import (this may take a few minutes)...\n');

  const ssh = new SSHClient();
  ssh.on('ready', () => {
    ssh.exec('cd /home/sisvertexunivers/public_html && php reimport-lms-grades.php 2>&1', (err, stream) => {
      if (err) {
        console.log('Error:', err.message);
        ssh.end();
        return;
      }

      stream.on('data', (data) => {
        const text = data.toString()
          .replace(/<h1>/g, '\n=== ')
          .replace(/<\/h1>/g, ' ===\n')
          .replace(/<pre>/g, '')
          .replace(/<\/pre>/g, '');
        process.stdout.write(text);
      });

      stream.on('close', () => {
        console.log('\n3. Cleanup...');
        ssh.exec('rm /home/sisvertexunivers/public_html/reimport-lms-grades.php', () => {
          console.log('   Done\n');
          ssh.end();
        });
      });
    });
  });

  ssh.connect(config);
}

main();
