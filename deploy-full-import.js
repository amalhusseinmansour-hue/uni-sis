import Client from 'ssh2-sftp-client';
import { Client as SSHClient } from 'ssh2';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
};

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║     Full LMS Grade Import                    ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  const sftp = new Client();
  try {
    console.log('1. Uploading import script...');
    await sftp.connect(config);
    await sftp.put('C:/Users/HP/Desktop/projects/sis/dist/full-lms-import.php', '/home/sisvertexunivers/public_html/full-lms-import.php');
    console.log('   Done\n');
    await sftp.end();
  } catch (err) {
    console.log('SFTP Error:', err.message);
    await sftp.end();
    return;
  }

  console.log('2. Running import (this may take several minutes)...\n');
  console.log('─'.repeat(50) + '\n');

  const ssh = new SSHClient();
  ssh.on('ready', () => {
    ssh.exec('cd /home/sisvertexunivers/public_html && php full-lms-import.php 2>&1', (err, stream) => {
      if (err) {
        console.log('Error:', err.message);
        ssh.end();
        return;
      }

      stream.on('data', (data) => {
        const text = data.toString()
          .replace(/<h1>/g, '\n═══ ')
          .replace(/<\/h1>/g, ' ═══\n')
          .replace(/<pre>/g, '')
          .replace(/<\/pre>/g, '');
        process.stdout.write(text);
      });

      stream.on('close', () => {
        console.log('\n' + '─'.repeat(50));
        console.log('\n3. Cleanup...');
        ssh.exec('rm /home/sisvertexunivers/public_html/full-lms-import.php', () => {
          console.log('   Done\n');
          console.log('╔══════════════════════════════════════════════╗');
          console.log('║     Import Complete!                         ║');
          console.log('╚══════════════════════════════════════════════╝');
          ssh.end();
        });
      });
    });
  });

  ssh.connect(config);
}

main();
