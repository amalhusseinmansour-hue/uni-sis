import Client from 'ssh2-sftp-client';
import { Client as SSHClient } from 'ssh2';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
};

async function main() {
  const sftp = new Client();
  try {
    await sftp.connect(config);
    await sftp.put('C:/Users/HP/Desktop/projects/sis/dist/check-user-api.php', '/home/sisvertexunivers/public_html/check-user-api.php');
    await sftp.end();
  } catch (err) {
    console.log('SFTP Error:', err.message);
    return;
  }

  const ssh = new SSHClient();
  ssh.on('ready', () => {
    ssh.exec('php /home/sisvertexunivers/public_html/check-user-api.php && rm /home/sisvertexunivers/public_html/check-user-api.php', (err, stream) => {
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
