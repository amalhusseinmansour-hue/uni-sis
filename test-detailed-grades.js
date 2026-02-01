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
  console.log('Testing detailed grade APIs...\n');

  const commands = [
    // Get available web service functions
    { name: '1. Get Available Grade Functions', cmd: `curl -s -X POST "https://lms.vertexuniversity.edu.eu/webservice/rest/server.php" -d "wstoken=ded9ef944fafa577f247fd38540b5ae5&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json" 2>/dev/null | grep -o '"name":"[^"]*grade[^"]*"' | head -20` },
    
    // Get enrolled users in a course (to find user IDs)
    { name: '2. Get Enrolled Users in Course 8', cmd: `curl -s -X POST "https://lms.vertexuniversity.edu.eu/webservice/rest/server.php" -d "wstoken=ded9ef944fafa577f247fd38540b5ae5&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid=8" 2>/dev/null | head -1000` },
    
    // Get grade items for a course
    { name: '3. Get Course Grade Items (Course 8)', cmd: `curl -s -X POST "https://lms.vertexuniversity.edu.eu/webservice/rest/server.php" -d "wstoken=ded9ef944fafa577f247fd38540b5ae5&wsfunction=gradereport_user_get_grade_items&moodlewsrestformat=json&courseid=8&userid=10" 2>/dev/null | head -1500` },
    
    // Try gradereport_overview for a specific user with courses
    { name: '4. Get Overview Grades for User 10', cmd: `curl -s -X POST "https://lms.vertexuniversity.edu.eu/webservice/rest/server.php" -d "wstoken=ded9ef944fafa577f247fd38540b5ae5&wsfunction=gradereport_overview_get_course_grades&moodlewsrestformat=json&userid=10" 2>/dev/null | head -500` },
    
    // Get user courses
    { name: '5. Get User Courses (User 10)', cmd: `curl -s -X POST "https://lms.vertexuniversity.edu.eu/webservice/rest/server.php" -d "wstoken=ded9ef944fafa577f247fd38540b5ae5&wsfunction=core_enrol_get_users_courses&moodlewsrestformat=json&userid=10" 2>/dev/null | head -1000` },
  ];

  let i = 0;

  function runNext() {
    if (i >= commands.length) {
      client.end();
      return;
    }

    const { name, cmd } = commands[i];
    console.log(`\n${name}:`);
    console.log('-'.repeat(60));

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
          console.log(JSON.stringify(json, null, 2).substring(0, 2000));
        } catch {
          console.log(data.toString().substring(0, 2000));
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
