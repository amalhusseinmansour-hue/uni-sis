import Client from 'ssh2-sftp-client';
import { Client as SSHClient } from 'ssh2';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
};

async function main() {
  console.log('=== Deploying and Running Empty Role Fix ===\n');

  // Step 1: Upload the fix script
  const sftp = new Client();
  try {
    console.log('1. Connecting via SFTP...');
    await sftp.connect(config);

    const localFile = 'C:/Users/HP/Desktop/projects/sis/dist/fix-empty-roles.php';
    const remoteFile = '/home/sisvertexunivers/public_html/fix-empty-roles.php';

    console.log('2. Uploading fix-empty-roles.php...');
    await sftp.put(localFile, remoteFile);
    console.log('   Upload complete!\n');

    await sftp.end();
  } catch (err) {
    console.log('SFTP Error:', err.message);
    await sftp.end();
    return;
  }

  // Step 2: Execute the script via SSH
  console.log('3. Executing fix script on server...\n');

  const ssh = new SSHClient();

  ssh.on('ready', () => {
    const cmd = 'cd /home/sisvertexunivers/public_html && php fix-empty-roles.php 2>&1';

    ssh.exec(cmd, (err, stream) => {
      if (err) {
        console.log('SSH Exec Error:', err.message);
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

      stream.stderr.on('data', (data) => {
        process.stderr.write(data.toString());
      });

      stream.on('close', () => {
        console.log('\n4. Cleaning up remote script...');
        ssh.exec('rm /home/sisvertexunivers/public_html/fix-empty-roles.php', (err2) => {
          if (!err2) {
            console.log('   Cleanup complete!');
          }
          console.log('\n=== All Done ===');
          ssh.end();
        });
      });
    });
  });

  ssh.on('error', (err) => {
    console.log('SSH Connection Error:', err.message);
  });

  ssh.connect(config);
}

main();
