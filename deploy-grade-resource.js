import Client from 'ssh2-sftp-client';
import { Client as SSHClient } from 'ssh2';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
};

async function main() {
  console.log('=== Deploying Updated GradeResource ===\n');

  const sftp = new Client();
  try {
    console.log('1. Uploading GradeResource.php...');
    await sftp.connect(config);
    await sftp.put(
      'C:/Users/HP/Desktop/projects/sis/backend-laravel/app/Filament/Resources/GradeResource.php',
      '/home/sisvertexunivers/laravel-backend/app/Filament/Resources/GradeResource.php'
    );
    console.log('   Done!\n');
    await sftp.end();
  } catch (err) {
    console.log('SFTP Error:', err.message);
    await sftp.end();
    return;
  }

  console.log('2. Clearing caches...');
  const ssh = new SSHClient();
  ssh.on('ready', () => {
    const cmd = `cd /home/sisvertexunivers/laravel-backend && \
      php artisan cache:clear && \
      php artisan config:clear && \
      php artisan view:clear && \
      php artisan filament:clear-cached-components && \
      php artisan filament:cache-components && \
      echo "Done!"`;
    
    ssh.exec(cmd, (err, stream) => {
      if (err) {
        console.log('Error:', err.message);
        ssh.end();
        return;
      }
      
      stream.on('data', (data) => {
        process.stdout.write(data.toString());
      });
      
      stream.on('close', () => {
        console.log('\n\n=== Deployment Complete ===');
        console.log('Open: https://sis.vertexuniversity.edu.eu/admin/grades');
        ssh.end();
      });
    });
  });
  ssh.connect(config);
}

main();
