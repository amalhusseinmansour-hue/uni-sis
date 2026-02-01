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
  console.log('=== Testing Moodle API ===\n');

  const cmd = `php -r "
    \\$moodleUrl = 'https://lms.vertexuniversity.net';
    \\$moodleToken = 'b86aeaborvt5t21eopfef0dre654321a';

    // Test 1: Get site info
    echo '1. Testing site info...\\n';
    \\$url = \\$moodleUrl . '/webservice/rest/server.php?wstoken=' . \\$moodleToken . '&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json';
    \\$ch = curl_init();
    curl_setopt(\\$ch, CURLOPT_URL, \\$url);
    curl_setopt(\\$ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt(\\$ch, CURLOPT_SSL_VERIFYPEER, false);
    \\$response = curl_exec(\\$ch);
    \\$error = curl_error(\\$ch);
    curl_close(\\$ch);

    if (\\$error) {
        echo 'Curl error: ' . \\$error . '\\n';
    } else {
        \\$data = json_decode(\\$response, true);
        if (isset(\\$data['exception'])) {
            echo 'API Error: ' . \\$data['message'] . '\\n';
        } else {
            echo 'Site: ' . (\\$data['sitename'] ?? 'Unknown') . '\\n';
            echo 'User: ' . (\\$data['username'] ?? 'Unknown') . '\\n';
        }
    }

    // Test 2: Get grades for user ID 7
    echo '\\n2. Testing grades for user 7...\\n';
    \\$url = \\$moodleUrl . '/webservice/rest/server.php?wstoken=' . \\$moodleToken . '&wsfunction=gradereport_overview_get_course_grades&userid=7&moodlewsrestformat=json';
    \\$ch = curl_init();
    curl_setopt(\\$ch, CURLOPT_URL, \\$url);
    curl_setopt(\\$ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt(\\$ch, CURLOPT_SSL_VERIFYPEER, false);
    \\$response = curl_exec(\\$ch);
    \\$error = curl_error(\\$ch);
    curl_close(\\$ch);

    if (\\$error) {
        echo 'Curl error: ' . \\$error . '\\n';
    } else {
        echo 'Response: ' . substr(\\$response, 0, 500) . '\\n';
    }
  "`;

  client.exec(cmd, (err, stream) => {
    if (err) {
      console.log('Error:', err.message);
      client.end();
      return;
    }

    stream.on('data', (data) => {
      process.stdout.write(data.toString());
    });

    stream.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });

    stream.on('close', () => {
      client.end();
    });
  });
});

client.connect(config);
