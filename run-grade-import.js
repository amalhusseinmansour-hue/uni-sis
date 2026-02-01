import { Client } from 'ssh2';

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@',
  readyTimeout: 30000,
};

const client = new Client();

client.on('ready', () => {
  console.log('Running grade import via PHP...\n');

  // Run PHP directly to call the service
  const cmd = `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="
    \\$service = app(App\\Services\\MoodleIntegrationService::class);
    \\$result = \\$service->importAllGradesFromMoodle();
    echo json_encode(\\$result);
  " 2>&1 | tail -1`;
  
  client.exec(cmd, { pty: true }, (err, stream) => {
    if (err) {
      console.error('Error:', err.message);
      client.end();
      return;
    }

    let output = '';
    stream.on('data', (data) => {
      output += data.toString();
    });

    stream.on('close', () => {
      console.log('Raw output:', output.substring(0, 5000));
      try {
        // Find JSON in output
        const jsonMatch = output.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const json = JSON.parse(jsonMatch[0]);
          console.log('\nParsed Result:');
          console.log('Success:', json.success);
          console.log('Failed:', json.failed);
          console.log('Skipped:', json.skipped);
          if (json.grades && json.grades.length > 0) {
            console.log('\nSample grades:');
            json.grades.slice(0, 10).forEach(g => {
              console.log(`  - ${g.student_name}: ${g.course_code} = ${g.grade}`);
            });
          }
        }
      } catch (e) {
        console.log('Parse error:', e.message);
      }
      client.end();
    });
  });
});

client.on('error', (err) => {
  console.error('Connection error:', err.message);
});

client.connect(config);
