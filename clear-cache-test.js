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
  console.log('=== Clear Cache & Test API ===\n');

  const cmd = `cd /home/sisvertexunivers/laravel-backend && \
    php artisan config:clear && \
    php artisan cache:clear && \
    php artisan view:clear && \
    echo "" && \
    echo "Cache cleared!" && \
    echo "" && \
    echo "Testing academic summary API for sample student..." && \
    php artisan tinker --execute="
      \$student = \App\Models\Student::whereHas('grades')->first();
      if (\$student) {
          echo 'Student: ' . \$student->student_id . ' - ' . \$student->name_en . PHP_EOL;
          \$response = app(\App\Http\Controllers\Api\ReportController::class)->academicSummary(\$student);
          \$data = \$response->getData(true);
          echo 'GPA: ' . \$data['academic_record']['cumulative_gpa'] . PHP_EOL;
          echo 'Credits Earned: ' . \$data['academic_record']['total_credits_earned'] . PHP_EOL;
          echo 'Credits Required: ' . \$data['academic_record']['credits_required'] . PHP_EOL;
          echo 'Standing: ' . \$data['academic_record']['academic_standing'] . PHP_EOL;
      } else {
          echo 'No student with grades found.';
      }
    " 2>/dev/null | tail -10`;

  client.exec(cmd, (err, stream) => {
    if (err) {
      console.log('Error:', err.message);
      client.end();
      return;
    }

    stream.on('data', (data) => {
      process.stdout.write(data.toString());
    });

    stream.on('close', () => {
      client.end();
    });
  });
});

client.connect(config);
