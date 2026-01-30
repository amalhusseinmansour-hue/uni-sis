<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('semesters', function (Blueprint $table) {
            if (!Schema::hasColumn('semesters', 'add_drop_start')) {
                $table->date('add_drop_start')->nullable()->after('registration_end');
            }
            if (!Schema::hasColumn('semesters', 'add_drop_end')) {
                $table->date('add_drop_end')->nullable()->after('add_drop_start');
            }
            if (!Schema::hasColumn('semesters', 'is_closed')) {
                $table->boolean('is_closed')->default(false)->after('is_current');
            }
        });
    }

    public function down(): void
    {
        Schema::table('semesters', function (Blueprint $table) {
            $table->dropColumn(['add_drop_start', 'add_drop_end', 'is_closed']);
        });
    }
};
