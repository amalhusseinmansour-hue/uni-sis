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
  
  // Check students in database
  const cmd = `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="
    echo '=== Students Count ===\n';
    echo App\\Models\\Student::count() . ' students\n\n';
    
    echo '=== First 3 Students ===\n';
    \\$students = App\\Models\\Student::with(['program.college', 'program.department'])->take(3)->get();
    foreach(\\$students as \\$s) {
      echo 'ID: ' . \\$s->id . '\n';
      echo 'Name: ' . \\$s->name_en . '\n';
      echo 'Student ID: ' . \\$s->student_id . '\n';
      echo 'Program: ' . (\\$s->program ? \\$s->program->name_en : 'NULL') . '\n';
      echo 'College: ' . (\\$s->program && \\$s->program->college ? \\$s->program->college->name_en : 'NULL') . '\n';
      echo 'Department: ' . (\\$s->program && \\$s->program->department ? \\$s->program->department->name_en : 'NULL') . '\n';
      echo '---\n';
    }
  "`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Error:', err);
      conn.end();
      return;
    }

    stream.on('close', () => {
      conn.end();
    }).on('data', (data) => {
      console.log(data.toString());
    }).stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
});

conn.on('error', (err) => {
  console.error('Connection Error:', err.message);
});

conn.connect(config);
