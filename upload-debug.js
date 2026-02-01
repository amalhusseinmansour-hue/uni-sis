import Client from 'ssh2-sftp-client';

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
    await sftp.put('C:/Users/HP/Desktop/projects/sis/dist/debug-api.php', '/home/sisvertexunivers/public_html/debug-api.php');
    console.log('Debug file uploaded');
    await sftp.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
