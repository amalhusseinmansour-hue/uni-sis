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

  const cmd = `cd /home/sisvertexunivers/laravel-backend && php artisan tinker --execute="
    // Get orphan user IDs
    \$orphanIds = \DB::table('users')
      ->where('role', 'STUDENT')
      ->whereNotIn('id', function(\$q) {
        \$q->select('user_id')->from('students')->whereNotNull('user_id');
      })
      ->pluck('id')
      ->toArray();
    
    echo 'Orphan IDs: ' . json_encode(\$orphanIds) . PHP_EOL;
    
    // Update them
    if (count(\$orphanIds) > 0) {
      \$updated = \DB::table('users')->whereIn('id', \$orphanIds)->update(['role' => 'INACTIVE']);
      echo 'Updated: ' . \$updated . PHP_EOL;
    }
    
    // Fix empty role user
    \$emptyRoleFixed = \DB::table('users')->where('role', '')->update(['role' => 'INACTIVE']);
    echo 'Fixed empty role: ' . \$emptyRoleFixed . PHP_EOL;
    
    // Show final counts
    echo 'Final counts: ' . json_encode(\DB::table('users')->select('role', \DB::raw('count(*) as cnt'))->groupBy('role')->get());
  " 2>/dev/null`;

  client.exec(cmd, (err, stream) => {
    if (err) {
      console.log('ERROR:', err.message);
      client.end();
      return;
    }

    stream.on('data', (data) => {
      console.log(data.toString());
    });

    stream.on('close', () => {
      client.end();
    });
  });
});

client.connect(config);
