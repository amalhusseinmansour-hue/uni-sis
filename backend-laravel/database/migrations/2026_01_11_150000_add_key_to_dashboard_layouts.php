<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('dashboard_layouts', 'key')) {
            Schema::table('dashboard_layouts', function (Blueprint $table) {
                $table->string('key')->nullable()->after('code');
            });

            // Copy code values to key
            DB::table('dashboard_layouts')->whereNull('key')->update([
                'key' => DB::raw('code')
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('dashboard_layouts', function (Blueprint $table) {
            $table->dropColumn('key');
        });
    }
};
