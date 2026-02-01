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
  console.log('=== Fixing Empty Role Users ===\n');

  const checks = [
    {
      name: '1. Find users with empty/null role',
      cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="
        \\$users = \\DB::table('users')
          ->where(function(\\$q) {
            \\$q->whereNull('role')
               ->orWhere('role', '')
               ->orWhere('role', ' ')
               ->orWhereRaw(\\\"TRIM(role) = ''\\\");
          })
          ->select('id', 'name', 'email', 'role')
          ->get();
        echo json_encode(\\$users);
      " 2>/dev/null | tail -1`
    },
    {
      name: '2. Update empty roles to INACTIVE',
      cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="
        \\$updated = \\DB::table('users')
          ->where(function(\\$q) {
            \\$q->whereNull('role')
               ->orWhere('role', '')
               ->orWhere('role', ' ')
               ->orWhereRaw(\\\"TRIM(role) = ''\\\");
          })
          ->update(['role' => 'INACTIVE']);
        echo 'Updated: ' . \\$updated;
      " 2>/dev/null | tail -1`
    },
    {
      name: '3. Final user counts by role',
      cmd: `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="
        echo json_encode(\\DB::table('users')->select('role', \\DB::raw('count(*) as cnt'))->groupBy('role')->orderByDesc('cnt')->get());
      " 2>/dev/null | tail -1`
    },
  ];

  let i = 0;

  function runNext() {
    if (i >= checks.length) {
      client.end();
      return;
    }

    const { name, cmd } = checks[i];
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
