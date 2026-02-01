import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
};

const localFile = 'C:/Users/HP/Desktop/projects/sis/app/Http/Controllers/Api/PaymentPlanController.php';
const remoteFile = '/home/sisvertexunivers/laravel-backend/app/Http/Controllers/Api/PaymentPlanController.php';

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH Connection established');
  
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      return;
    }
    
    const content = fs.readFileSync(localFile, 'utf-8');
    sftp.writeFile(remoteFile, content, (err) => {
      if (err) {
        console.error('Write error:', err);
      } else {
        console.log('PaymentPlanController.php uploaded successfully');
      }
      
      // Clear cache
      conn.exec('cd /home/sisvertexunivers/laravel-backend && php artisan config:clear && php artisan cache:clear', (err, stream) => {
        if (err) {
          console.error('Exec error:', err);
          conn.end();
          return;
        }
        
        stream.on('close', () => {
          console.log('Cache cleared');
          conn.end();
        }).on('data', (data) => {
          console.log(data.toString());
        }).stderr.on('data', (data) => {
          console.error(data.toString());
        });
      });
    });
  });
}).on('error', (err) => {
  console.error('SSH Connection error:', err.message);
}).connect(config);
