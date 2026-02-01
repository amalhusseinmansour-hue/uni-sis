import Client from 'ssh2-sftp-client';
import { Client as SSHClient } from 'ssh2';
const config = { host: '69.72.248.125', port: 22, username: 'sisvertexunivers', password: 'Vertexuni23@@' };
async function main() {
  const sftp = new Client();
  await sftp.connect(config);
  await sftp.put('C:/Users/HP/Desktop/projects/sis/dist/verify-api.php', '/home/sisvertexunivers/public_html/verify-api.php');
  await sftp.end();
  const ssh = new SSHClient();
  ssh.on('ready', () => {
    ssh.exec('php /home/sisvertexunivers/public_html/verify-api.php && rm /home/sisvertexunivers/public_html/verify-api.php', (err, stream) => {
      stream.on('data', (data) => process.stdout.write(data.toString()));
      stream.on('close', () => ssh.end());
    });
  });
  ssh.connect(config);
}
main();
