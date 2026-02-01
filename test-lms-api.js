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
  console.log('Testing LMS API endpoints...\n');

  const commands = [
    // Test get students from LMS
    { name: '1. Test Moodle Status API', cmd: `curl -s "https://sisvertexunivers.com/api/moodle/status" -H "Accept: application/json" 2>/dev/null | head -200` },

    // Test get all users from Moodle
    { name: '2. Get Users from Moodle', cmd: `curl -s -X POST "https://lms.vertexuniversity.edu.eu/webservice/rest/server.php" -d "wstoken=ded9ef944fafa577f247fd38540b5ae5&wsfunction=core_user_get_users&moodlewsrestformat=json&criteria[0][key]=email&criteria[0][value]=%25" 2>/dev/null | head -500` },

    // Test get courses
    { name: '3. Get Courses from Moodle', cmd: `curl -s -X POST "https://lms.vertexuniversity.edu.eu/webservice/rest/server.php" -d "wstoken=ded9ef944fafa577f247fd38540b5ae5&wsfunction=core_course_get_courses&moodlewsrestformat=json" 2>/dev/null | head -500` },

    // Test grades with available function
    { name: '4. Get Grades (overview)', cmd: `curl -s -X POST "https://lms.vertexuniversity.edu.eu/webservice/rest/server.php" -d "wstoken=ded9ef944fafa577f247fd38540b5ae5&wsfunction=gradereport_overview_get_course_grades&moodlewsrestformat=json&userid=225" 2>/dev/null | head -500` },
  ];

  let i = 0;

  function runNext() {
    if (i >= commands.length) {
      client.end();
      return;
    }

    const { name, cmd } = commands[i];
    console.log(`\n${name}:`);
    console.log('-'.repeat(50));

    client.exec(cmd, (err, stream) => {
      if (err) {
        console.error('Error:', err.message);
        i++;
        runNext();
        return;
      }

      stream.on('data', (data) => {
        try {
          const json = JSON.parse(data.toString());
          console.log(JSON.stringify(json, null, 2).substring(0, 1000));
        } catch {
          console.log(data.toString().substring(0, 1000));
        }
      });

      stream.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      stream.on('close', () => {
        i++;
        runNext();
      });
    });
  }

  runNext();
});

client.on('error', (err) => {
  console.error('Connection error:', err.message);
});

client.connect(config);
