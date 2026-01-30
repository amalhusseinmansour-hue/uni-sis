const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@'
};

const laravelDir = '/home/sisvertexunivers/laravel-backend';

conn.on('ready', () => {
  console.log('Connected to server');

  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP Error:', err);
      conn.end();
      return;
    }

    const localPath = path.join(__dirname, 'backend-laravel/public/import-all-grades.php');
    const remotePath = laravelDir + '/public/import-all-grades.php';

    console.log('Uploading import-lms-grades.php...');

    sftp.fastPut(localPath, remotePath, (err) => {
      if (err) {
        console.error('Error uploading:', err.message);
        conn.end();
        return;
      }

      console.log('Uploaded successfully!');
      console.log('\nExecuting script...\n');

      // Execute the PHP script with longer timeout
      conn.exec(`cd ${laravelDir} && php public/import-all-grades.php 2>&1`, (err, stream) => {
        if (err) {
          console.error('Exec error:', err);
          conn.end();
          return;
        }

        let output = '';
        stream.on('close', (code) => {
          console.log('\nScript finished with code:', code);

          // Delete the script after execution
          sftp.unlink(remotePath, (err) => {
            if (!err) {
              console.log('Cleanup: Deleted the script from server');
            }
            conn.end();
          });
        }).on('data', (data) => {
          const text = data.toString();
          output += text;
          process.stdout.write(text);
        }).stderr.on('data', (data) => {
          console.error('STDERR:', data.toString());
        });
      });
    });
  });
});

conn.on('error', (err) => {
  console.error('Connection Error:', err.message);
});

conn.connect(config);
