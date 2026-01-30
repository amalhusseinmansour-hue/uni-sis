<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // For SQLite, we need to recreate the column since it doesn't support ALTER ENUM
        // First, create a new column with the updated enum values
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('type_new')->default('INFO')->after('message_ar');
        });

        // Copy data from old column
        DB::statement('UPDATE notifications SET type_new = type');

        // Drop old column and rename new one
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn('type');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->renameColumn('type_new', 'type');
        });
    }

    public function down(): void
    {
        // Reverse the migration (convert back to original enum types)
        Schema::table('notifications', function (Blueprint $table) {
            $table->enum('type_old', [
                'INFO',
                'SUCCESS',
                'WARNING',
                'ERROR',
                'ACADEMIC',
                'FINANCIAL',
                'GRADE',
                'ENROLLMENT',
                'ANNOUNCEMENT',
                'SERVICE_REQUEST'
            ])->default('INFO')->after('message_ar');
        });

        DB::statement("UPDATE notifications SET type_old = CASE WHEN type IN ('INFO','SUCCESS','WARNING','ERROR','ACADEMIC','FINANCIAL','GRADE','ENROLLMENT','ANNOUNCEMENT','SERVICE_REQUEST') THEN type ELSE 'INFO' END");

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn('type');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->renameColumn('type_old', 'type');
        });
    }
};
