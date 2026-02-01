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
  console.log('Checking grades for multiple students...\n');

  const commands = [
    // Check all courses with their categories (for semester identification)
    { name: '1. All Courses with Categories', cmd: `curl -s -X POST "https://lms.vertexuniversity.edu.eu/webservice/rest/server.php" -d "wstoken=ded9ef944fafa577f247fd38540b5ae5&wsfunction=core_course_get_courses&moodlewsrestformat=json" 2>/dev/null | jq '[.[] | {id, shortname, fullname, categoryid, startdate}]' | head -100` },
    
    // Get categories to understand semester structure
    { name: '2. Course Categories', cmd: `curl -s -X POST "https://lms.vertexuniversity.edu.eu/webservice/rest/server.php" -d "wstoken=ded9ef944fafa577f247fd38540b5ae5&wsfunction=core_course_get_categories&moodlewsrestformat=json" 2>/dev/null` },
    
    // Check grades for several students
    { name: '3. Grades for User 9 (Iman)', cmd: `curl -s -X POST "https://lms.vertexuniversity.edu.eu/webservice/rest/server.php" -d "wstoken=ded9ef944fafa577f247fd38540b5ae5&wsfunction=gradereport_overview_get_course_grades&moodlewsrestformat=json&userid=9" 2>/dev/null` },
    
    { name: '4. Grades for User 36 (Tariq)', cmd: `curl -s -X POST "https://lms.vertexuniversity.edu.eu/webservice/rest/server.php" -d "wstoken=ded9ef944fafa577f247fd38540b5ae5&wsfunction=gradereport_overview_get_course_grades&moodlewsrestformat=json&userid=36" 2>/dev/null` },
    
    // Check what's in the database currently
    { name: '5. Check Database LMS Grades', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\DB::table('moodle_grades')->take(10)->get());" 2>/dev/null | tail -1` },
    
    // Check semesters
    { name: '6. Check Semesters in DB', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\DB::table('semesters')->get());" 2>/dev/null | tail -1` },
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

      let output = '';
      stream.on('data', (data) => {
        output += data.toString();
      });

      stream.stderr.on('data', (data) => {
        // ignore stderr
      });

      stream.on('close', () => {
        try {
          const json = JSON.parse(output);
          console.log(JSON.stringify(json, null, 2).substring(0, 2500));
        } catch {
          console.log(output.substring(0, 2500));
        }
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
