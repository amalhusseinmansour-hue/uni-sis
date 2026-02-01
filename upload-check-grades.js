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
    await sftp.put('C:/Users/HP/Desktop/projects/sis/dist/check-grades-data.php', '/home/sisvertexunivers/public_html/check-grades-data.php');
    await sftp.end();
  } catch (err) {
    console.log('SFTP Error:', err.message);
    return;
  }

  const ssh = new SSHClient();
  ssh.on('ready', () => {
    ssh.exec('php /home/sisvertexunivers/public_html/check-grades-data.php', (err, stream) => {
      if (err) {
        console.log('Error:', err.message);
        ssh.end();
        return;
      }
      
      let output = '';
      stream.on('data', (data) => {
        output += data.toString();
      });
      
      stream.on('close', () => {
        try {
          const json = JSON.parse(output);
          console.log('=== Grades Data ===\n');
          console.log('Total grades:', json.total_grades);
          console.log('With scores:', json.with_scores);
          console.log('\nBy Semester:');
          json.by_semester.forEach(s => {
            console.log(`  ${s.name_en}: ${s.total} grades (${s.with_scores} with scores)`);
          });
          console.log('\nSample Grades with Scores:');
          json.sample_grades.slice(0, 10).forEach(g => {
            console.log(`  ${g.student} - ${g.course}: ${g.total} (${g.grade})`);
          });
        } catch (e) {
          console.log(output);
        }
        ssh.end();
      });
    });
  });
  ssh.connect(config);
}

main();
