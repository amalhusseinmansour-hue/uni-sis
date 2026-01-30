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

const remoteDir = '/home/sisvertexunivers/public_html';
const laravelDir = '/home/sisvertexunivers/laravel-backend';

const filesToUpload = [
  // Frontend files
  { local: 'dist/index.html', remote: '/index.html', baseDir: remoteDir },
  { local: 'dist/assets/index-DTnlQB9O.js', remote: '/assets/index-DTnlQB9O.js', baseDir: remoteDir },
  { local: 'dist/assets/index-C_6mitgZ.css', remote: '/assets/index-C_6mitgZ.css', baseDir: remoteDir },
  { local: 'dist/assets/html2canvas.esm-QH1iLAAe.js', remote: '/assets/html2canvas.esm-QH1iLAAe.js', baseDir: remoteDir },
  { local: 'dist/assets/attendance-9XHKOUvL.js', remote: '/assets/attendance-9XHKOUvL.js', baseDir: remoteDir },

  // Backend - Services
  { local: 'app/Services/MoodleIntegrationService.php', remote: '/app/Services/MoodleIntegrationService.php', baseDir: laravelDir },

  // Backend - MoodleSyncController
  { local: 'app/Http/Controllers/Api/MoodleSyncController.php', remote: '/app/Http/Controllers/Api/MoodleSyncController.php', baseDir: laravelDir },

  // Backend - Routes
  { local: 'routes/api.php', remote: '/routes/api.php', baseDir: laravelDir },
];

// Helper function to create directory recursively via SFTP
function mkdirRecursive(sftp, dir, callback) {
  sftp.stat(dir, (err) => {
    if (!err) {
      // Directory exists
      callback(null);
      return;
    }

    // Directory doesn't exist, create parent first
    const parent = path.posix.dirname(dir);
    if (parent === dir || parent === '/') {
      // Root or same directory
      sftp.mkdir(dir, (err) => {
        callback(err && err.code !== 4 ? err : null); // Ignore "already exists" error
      });
      return;
    }

    mkdirRecursive(sftp, parent, (err) => {
      if (err) {
        callback(err);
        return;
      }
      sftp.mkdir(dir, (err) => {
        callback(err && err.code !== 4 ? err : null); // Ignore "already exists" error
      });
    });
  });
}

// Upload files sequentially
async function uploadFiles(sftp, files) {
  for (const file of files) {
    const localPath = path.join(__dirname, file.local);
    const remotePath = (file.baseDir || remoteDir) + file.remote;
    const remoteFileDir = path.posix.dirname(remotePath);

    // Check if local file exists
    if (!fs.existsSync(localPath)) {
      console.error(`⚠️  Local file not found: ${file.local}`);
      continue;
    }

    // Create remote directory
    await new Promise((resolve, reject) => {
      mkdirRecursive(sftp, remoteFileDir, (err) => {
        if (err) {
          console.error(`Error creating directory ${remoteFileDir}:`, err.message);
        }
        resolve();
      });
    });

    // Upload file
    await new Promise((resolve) => {
      console.log(`📤 Uploading ${file.local}...`);
      sftp.fastPut(localPath, remotePath, (err) => {
        if (err) {
          console.error(`❌ Error uploading ${file.local}:`, err.message);
        } else {
          console.log(`✅ Uploaded: ${file.local}`);
        }
        resolve();
      });
    });
  }
}

conn.on('ready', () => {
  console.log('🔗 Connected to server\n');

  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP Error:', err);
      conn.end();
      return;
    }

    uploadFiles(sftp, filesToUpload).then(() => {
      console.log('\n🎉 Deployment complete!');
      console.log('\n⚠️  Remember to run migrations on the server:');
      console.log('   cd /home/sisvertexunivers/laravel-backend && php artisan migrate');
      conn.end();
    });
  });
});

conn.on('error', (err) => {
  console.error('Connection Error:', err.message);
});

conn.connect(config);
