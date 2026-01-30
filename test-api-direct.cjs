const { Client } = require('ssh2');

const conn = new Client();

const config = {
  host: '69.72.248.125',
  port: 22,
  username: 'sisvertexunivers',
  password: 'Vertexuni23@@'
};

conn.on('ready', () => {
  console.log('Connected');
  
  // Test the API directly using curl with auth
  const cmd = `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="
    // Get a valid token
    \\$user = App\\Models\\User::where('role', 'ADMIN')->first();
    if (!\\$user) {
      \\$user = App\\Models\\User::first();
    }
    \\$token = \\$user->createToken('test')->plainTextToken;
    echo 'Token: ' . substr(\\$token, 0, 20) . '...\n\n';
    
    // Test fetching a student with relationships
    \\$student = App\\Models\\Student::with(['program.college', 'program.department'])->first();
    echo json_encode(\\$student, JSON_PRETTY_PRINT);
  "`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Error:', err);
      conn.end();
      return;
    }

    let output = '';
    stream.on('close', () => {
      console.log(output);
      conn.end();
    }).on('data', (data) => {
      output += data.toString();
    }).stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
});

conn.on('error', (err) => {
  console.error('Connection Error:', err.message);
});

conn.connect(config);
