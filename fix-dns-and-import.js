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
  console.log('=== Testing LMS Connection ===\n');

  // Test with the correct URL and IP
  const cmd = `php -r "
    // Test direct connection to LMS
    \\$moodleUrl = 'https://lms.vertexuniversity.edu.eu';
    \\$moodleToken = 'ded9ef944fafa577f247fd38540b5ae5';

    echo '1. Testing connection to LMS...\\n';

    \\$url = \\$moodleUrl . '/webservice/rest/server.php?wstoken=' . \\$moodleToken . '&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json';

    \\$ch = curl_init();
    curl_setopt(\\$ch, CURLOPT_URL, \\$url);
    curl_setopt(\\$ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt(\\$ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt(\\$ch, CURLOPT_TIMEOUT, 30);
    curl_setopt(\\$ch, CURLOPT_RESOLVE, array('lms.vertexuniversity.edu.eu:443:31.97.32.223'));

    \\$response = curl_exec(\\$ch);
    \\$error = curl_error(\\$ch);
    \\$httpCode = curl_getinfo(\\$ch, CURLINFO_HTTP_CODE);
    curl_close(\\$ch);

    echo 'HTTP Code: ' . \\$httpCode . '\\n';

    if (\\$error) {
        echo 'Curl error: ' . \\$error . '\\n';
    } else {
        \\$data = json_decode(\\$response, true);
        if (isset(\\$data['exception'])) {
            echo 'API Error: ' . \\$data['message'] . '\\n';
        } elseif (isset(\\$data['sitename'])) {
            echo 'Success! Site: ' . \\$data['sitename'] . '\\n';
            echo 'Username: ' . \\$data['username'] . '\\n';
            echo 'User ID: ' . \\$data['userid'] . '\\n';
        } else {
            echo 'Response: ' . substr(\\$response, 0, 300) . '\\n';
        }
    }

    // Test grades API
    echo '\\n2. Testing grades API for user 7...\\n';
    \\$url = \\$moodleUrl . '/webservice/rest/server.php?wstoken=' . \\$moodleToken . '&wsfunction=gradereport_overview_get_course_grades&userid=7&moodlewsrestformat=json';

    \\$ch = curl_init();
    curl_setopt(\\$ch, CURLOPT_URL, \\$url);
    curl_setopt(\\$ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt(\\$ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt(\\$ch, CURLOPT_TIMEOUT, 30);
    curl_setopt(\\$ch, CURLOPT_RESOLVE, array('lms.vertexuniversity.edu.eu:443:31.97.32.223'));

    \\$response = curl_exec(\\$ch);
    \\$error = curl_error(\\$ch);
    curl_close(\\$ch);

    if (\\$error) {
        echo 'Curl error: ' . \\$error . '\\n';
    } else {
        \\$data = json_decode(\\$response, true);
        if (isset(\\$data['grades'])) {
            echo 'Found ' . count(\\$data['grades']) . ' course grades\\n';
            foreach (array_slice(\\$data['grades'], 0, 3) as \\$g) {
                echo '  - Course ' . \\$g['courseid'] . ': ' . (\\$g['grade'] ?? 'N/A') . '\\n';
            }
        } else {
            echo 'Response: ' . substr(\\$response, 0, 500) . '\\n';
        }
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
