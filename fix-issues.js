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
  console.log('=== Fixing Issues ===\n');

  const fixes = [
    // Fix orphan users - change their role to prevent login issues
    { name: '1. Disable orphan student users (change role)', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="
      \$orphanIds = \DB::table('users')
        ->where('role','STUDENT')
        ->leftJoin('students','users.id','=','students.user_id')
        ->whereNull('students.id')
        ->pluck('users.id');
      \$updated = \DB::table('users')->whereIn('id', \$orphanIds)->update(['role' => 'DISABLED']);
      echo 'Updated ' . \$updated . ' orphan users';
    " 2>/dev/null | tail -1` },
    
    // Check result
    { name: '2. Verify fix', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo \DB::table('users')->where('role','STUDENT')->leftJoin('students','users.id','=','students.user_id')->whereNull('students.id')->count();" 2>/dev/null | tail -1` },
    
    // Check for any other role issues
    { name: '3. Users by role', cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="echo json_encode(\DB::table('users')->select('role',\DB::raw('count(*) as cnt'))->groupBy('role')->get());" 2>/dev/null | tail -1` },
  ];

  let i = 0;

  function runNext() {
    if (i >= fixes.length) {
      client.end();
      return;
    }

    const { name, cmd } = fixes[i];
    console.log(`${name}:`);

    client.exec(cmd, (err, stream) => {
      if (err) {
        console.log('  ERROR:', err.message);
        i++;
        runNext();
        return;
      }

      let output = '';
      stream.on('data', (data) => {
        output += data.toString();
      });

      stream.on('close', () => {
        const result = output.trim();
        try {
          const json = JSON.parse(result);
          console.log(JSON.stringify(json, null, 2));
        } catch {
          console.log('  ', result);
        }
        console.log('');
        i++;
        runNext();
      });
    });
  }

  runNext();
});

client.connect(config);
