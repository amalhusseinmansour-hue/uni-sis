import Client from 'ssh2-sftp-client';
import { Client as SSHClient } from 'ssh2';
const config = { host: '69.72.248.125', port: 22, username: 'sisvertexunivers', password: 'Vertexuni23@@' };
async function main() {
  const sftp = new Client();
  await sftp.connect(config);
  await sftp.put('C:/Users/HP/Desktop/projects/sis/dist/get-personal-info.php', '/home/sisvertexunivers/public_html/get-personal-info.php');
  await sftp.end();
  const ssh = new SSHClient();
  ssh.on('ready', () => {
    ssh.exec('php /home/sisvertexunivers/public_html/get-personal-info.php && rm /home/sisvertexunivers/public_html/get-personal-info.php', (err, stream) => {
      stream.on('data', (data) => process.stdout.write(data.toString()));
      stream.on('close', () => ssh.end());
    });
  });
  ssh.connect(config);
}
main();
