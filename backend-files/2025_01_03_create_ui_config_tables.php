<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // System Settings table
        if (!Schema::hasTable('system_settings')) {
            Schema::create('system_settings', function (Blueprint $table) {
                $table->id();
                $table->string('group')->default('general');
                $table->string('key')->unique();
                $table->text('value')->nullable();
                $table->string('type')->default('string'); // string, number, boolean, json, file
                $table->string('label_en')->nullable();
                $table->string('label_ar')->nullable();
                $table->text('description_en')->nullable();
                $table->text('description_ar')->nullable();
                $table->integer('order')->default(0);
                $table->boolean('is_public')->default(false);
                $table->timestamps();

                $table->index(['group', 'order']);
            });
        }

        // UI Themes table
        if (!Schema::hasTable('ui_themes')) {
            Schema::create('ui_themes', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->string('name_en');
                $table->string('name_ar');
                $table->text('description_en')->nullable();
                $table->text('description_ar')->nullable();
                $table->json('colors')->nullable();
                $table->json('typography')->nullable();
                $table->json('spacing')->nullable();
                $table->json('borders')->nullable();
                $table->json('shadows')->nullable();
                $table->boolean('is_default')->default(false);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Menus table
        if (!Schema::hasTable('menus')) {
            Schema::create('menus', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->string('name_en');
                $table->string('name_ar');
                $table->text('description_en')->nullable();
                $table->text('description_ar')->nullable();
                $table->string('role')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Menu Items table
        if (!Schema::hasTable('menu_items')) {
            Schema::create('menu_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('menu_id')->constrained()->onDelete('cascade');
                $table->foreignId('parent_id')->nullable()->constrained('menu_items')->onDelete('cascade');
                $table->string('title_en');
                $table->string('title_ar');
                $table->string('icon')->nullable();
                $table->string('route')->nullable();
                $table->boolean('is_external')->default(false);
                $table->string('permission')->nullable();
                $table->json('roles')->nullable();
                $table->string('badge_type')->nullable();
                $table->string('badge_value')->nullable();
                $table->integer('order_column')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->index(['menu_id', 'parent_id', 'order_column']);
            });
        }

        // Dashboard Widgets table
        if (!Schema::hasTable('dashboard_widgets')) {
            Schema::create('dashboard_widgets', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->string('name_en');
                $table->string('name_ar');
                $table->text('description_en')->nullable();
                $table->text('description_ar')->nullable();
                $table->string('type')->default('stat_card'); // stat_card, chart, table, list, calendar, custom
                $table->string('component')->nullable();
                $table->string('data_source')->nullable();
                $table->json('config')->nullable();
                $table->integer('refresh_interval')->nullable();
                $table->integer('cache_duration')->nullable();
                $table->json('roles')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Dashboard Layouts table
        if (!Schema::hasTable('dashboard_layouts')) {
            Schema::create('dashboard_layouts', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->string('name_en');
                $table->string('name_ar');
                $table->text('description_en')->nullable();
                $table->text('description_ar')->nullable();
                $table->string('role')->nullable();
                $table->integer('columns')->default(3);
                $table->string('gap')->default('1rem');
                $table->json('widgets')->nullable(); // Array of widget configurations with positions
                $table->boolean('is_default')->default(false);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Page Configurations table
        if (!Schema::hasTable('page_configurations')) {
            Schema::create('page_configurations', function (Blueprint $table) {
                $table->id();
                $table->string('page_key')->unique();
                $table->string('title_en');
                $table->string('title_ar');
                $table->text('description_en')->nullable();
                $table->text('description_ar')->nullable();
                $table->string('icon')->nullable();
                $table->json('breadcrumbs')->nullable();
                $table->json('header_actions')->nullable();
                $table->json('tabs')->nullable();
                $table->json('components')->nullable();
                $table->json('roles')->nullable();
                $table->json('settings')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Insert default theme
        if (Schema::hasTable('ui_themes')) {
            \Illuminate\Support\Facades\DB::table('ui_themes')->insertOrIgnore([
                'key' => 'default',
                'name_en' => 'Default Theme',
                'name_ar' => 'المظهر الافتراضي',
                'colors' => json_encode([
                    'primary' => '#1e40af',
                    'secondary' => '#3b82f6',
                    'accent' => '#f59e0b',
                    'success' => '#10b981',
                    'warning' => '#f59e0b',
                    'error' => '#ef4444',
                    'info' => '#3b82f6',
                    'background' => '#f8fafc',
                    'surface' => '#ffffff',
                    'text' => '#1e293b',
                    'text_secondary' => '#64748b',
                    'border' => '#e2e8f0',
                ]),
                'typography' => json_encode([
                    'font_family' => 'Inter, sans-serif',
                    'font_family_ar' => 'Cairo, sans-serif',
                    'base_size' => '16px',
                    'heading_weight' => '600',
                    'body_weight' => '400',
                ]),
                'is_default' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_configurations');
        Schema::dropIfExists('dashboard_layouts');
        Schema::dropIfExists('dashboard_widgets');
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('menus');
        Schema::dropIfExists('ui_themes');
        Schema::dropIfExists('system_settings');
    }
};
