import Client from 'ssh2-sftp-client';
import { Client as SSHClient } from 'ssh2';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
};

async function main() {
  console.log('=== Adding INACTIVE Role and Fixing Users ===\n');

  const sftp = new Client();
  try {
    console.log('1. Uploading script...');
    await sftp.connect(config);
    await sftp.put('C:/Users/HP/Desktop/projects/sis/dist/add-inactive-role.php', '/home/sisvertexunivers/public_html/add-inactive-role.php');
    console.log('   Done\n');
    await sftp.end();
  } catch (err) {
    console.log('SFTP Error:', err.message);
    await sftp.end();
    return;
  }

  console.log('2. Executing script...\n');

  const ssh = new SSHClient();
  ssh.on('ready', () => {
    ssh.exec('cd /home/sisvertexunivers/public_html && php add-inactive-role.php 2>&1', (err, stream) => {
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
        ssh.exec('rm /home/sisvertexunivers/public_html/add-inactive-role.php', () => {
          console.log('   Done\n');
          ssh.end();
        });
      });
    });
  });

  ssh.connect(config);
}

main();
