import Client from 'ssh2-sftp-client';
import { Client as SSHClient } from 'ssh2';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
};

async function main() {
  console.log('=== Fixing Grading Scales Table ===\n');

  const sftp = new Client();
  try {
    await sftp.connect(config);
    await sftp.put('C:/Users/HP/Desktop/projects/sis/dist/fix-grading-scales.php', '/home/sisvertexunivers/public_html/fix-grading-scales.php');
    await sftp.end();
  } catch (err) {
    console.log('SFTP Error:', err.message);
    return;
  }

  const ssh = new SSHClient();
  ssh.on('ready', () => {
    ssh.exec('php /home/sisvertexunivers/public_html/fix-grading-scales.php && rm /home/sisvertexunivers/public_html/fix-grading-scales.php', (err, stream) => {
      if (err) {
        console.log('Error:', err.message);
        ssh.end();
        return;
      }
      
      stream.on('data', (data) => {
        process.stdout.write(data.toString());
      });
      
      stream.on('close', () => {
        ssh.end();
      });
    });
  });
  ssh.connect(config);
}

main();
