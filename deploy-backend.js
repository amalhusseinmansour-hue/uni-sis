import Client from 'ssh2-sftp-client';
import fs from 'fs';
import path from 'path';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
};

const localBasePath = 'C:/Users/HP/Desktop/projects/sis';
const remoteBasePath = '/home/sisvertexunivers/laravel-backend';

const filesToUpload = [
  'app/Http/Controllers/Api/PaymentPlanController.php',
  'app/Http/Controllers/Api/ScholarshipController.php',
  'app/Http/Controllers/Api/FinancialRecordController.php',
  'app/Models/PaymentPlan.php',
  'app/Models/PaymentPlanInstallment.php',
  'app/Models/Scholarship.php',
  'app/Models/StudentScholarship.php',
  'app/Models/FeeStructure.php',
  'database/seeders/PaymentPlanSeeder.php',
  'database/seeders/ScholarshipSeeder.php',
  'database/seeders/FeeStructureSeeder.php',
  'routes/api.php',
];

async function main() {
  console.log('=== Deploying Backend Files ===\n');

  const sftp = new Client();
  try {
    await sftp.connect(config);

    for (const file of filesToUpload) {
      const localPath = path.join(localBasePath, file).replace(/\\/g, '/');
      const remotePath = `${remoteBasePath}/${file}`;

      // Ensure directory exists
      const remoteDir = path.dirname(remotePath);
      try {
        await sftp.mkdir(remoteDir, true);
      } catch (e) { /* ignore */ }

      console.log(`Uploading: ${file}`);
      await sftp.put(localPath, remotePath);
    }

    console.log('\n=== Backend Deployment Complete ===');

    // Clear Laravel cache
    console.log('\nClearing Laravel cache...');

    await sftp.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
