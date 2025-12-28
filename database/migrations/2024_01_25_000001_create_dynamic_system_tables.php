<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ===================================================================
        // SYSTEM SETTINGS - الإعدادات العامة
        // ===================================================================

        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('group')->index(); // general, email, sms, payment, etc.
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, number, boolean, json, file
            $table->string('label_en');
            $table->string('label_ar');
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->json('options')->nullable(); // For select type
            $table->json('validation')->nullable();
            $table->boolean('is_public')->default(false);
            $table->boolean('is_encrypted')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // ===================================================================
        // UI SETTINGS - إعدادات الواجهة
        // ===================================================================

        Schema::create('ui_themes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name_en');
            $table->string('name_ar');
            $table->json('colors'); // primary, secondary, accent, background, etc.
            $table->json('typography')->nullable(); // fonts, sizes
            $table->json('spacing')->nullable(); // margins, paddings
            $table->json('borders')->nullable(); // radius, widths
            $table->json('shadows')->nullable();
            $table->boolean('is_dark')->default(false);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('ui_layouts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name_en');
            $table->string('name_ar');
            $table->string('type'); // sidebar, topbar, both, minimal
            $table->json('settings'); // sidebar_width, header_height, etc.
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ===================================================================
        // MENU CONFIGURATION - إعدادات القوائم
        // ===================================================================

        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name_en');
            $table->string('name_ar');
            $table->string('location'); // sidebar, topbar, footer, user_menu
            $table->json('roles')->nullable(); // Which roles can see this menu
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('menu_items')->onDelete('cascade');
            $table->string('title_en');
            $table->string('title_ar');
            $table->string('icon')->nullable();
            $table->string('route')->nullable();
            $table->string('url')->nullable();
            $table->string('target')->default('_self'); // _self, _blank
            $table->json('roles')->nullable();
            $table->json('permissions')->nullable();
            $table->string('badge_type')->nullable(); // count, dot, text
            $table->string('badge_source')->nullable(); // API endpoint for badge value
            $table->string('badge_color')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // ===================================================================
        // DASHBOARD WIDGETS - ودجات لوحة التحكم
        // ===================================================================

        Schema::create('dashboard_widgets', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name_en');
            $table->string('name_ar');
            $table->string('type'); // stat_card, chart, table, list, calendar, custom
            $table->string('component')->nullable(); // Custom component name
            $table->json('data_source')->nullable(); // API endpoint or query
            $table->json('settings')->nullable();
            $table->json('styles')->nullable();
            $table->string('size')->default('small'); // small, medium, large, full
            $table->json('roles')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('dashboard_layouts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name_en');
            $table->string('name_ar');
            $table->string('role')->nullable(); // For role-specific dashboards
            $table->json('widgets'); // Array of widget placements
            $table->json('grid_settings')->nullable();
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ===================================================================
        // DYNAMIC TABLES - الجداول الديناميكية
        // ===================================================================

        Schema::create('dynamic_tables', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name_en');
            $table->string('name_ar');
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('model_class')->nullable();
            $table->string('api_endpoint')->nullable();
            $table->json('settings');
            $table->json('roles')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('dynamic_table_columns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dynamic_table_id')->constrained()->onDelete('cascade');
            $table->string('column_key');
            $table->string('field_name');
            $table->string('header_en');
            $table->string('header_ar');
            $table->string('data_type'); // string, number, date, boolean, status, relation, image, link, actions
            $table->string('align')->default('left'); // left, center, right
            $table->string('width')->nullable();
            $table->string('min_width')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->boolean('is_sortable')->default(false);
            $table->boolean('is_searchable')->default(false);
            $table->boolean('is_exportable')->default(true);
            $table->json('format')->nullable(); // Formatting options
            $table->json('cell_style')->nullable();
            $table->json('conditional_styles')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('dynamic_table_filters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dynamic_table_id')->constrained()->onDelete('cascade');
            $table->string('filter_key');
            $table->string('field_name');
            $table->string('label_en');
            $table->string('label_ar');
            $table->string('filter_type'); // text, select, multiselect, date, date_range, number_range, boolean
            $table->json('options')->nullable();
            $table->json('data_source')->nullable(); // For dynamic options
            $table->string('default_value')->nullable();
            $table->string('placeholder_en')->nullable();
            $table->string('placeholder_ar')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->boolean('is_required')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('dynamic_table_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dynamic_table_id')->constrained()->onDelete('cascade');
            $table->string('action_key');
            $table->string('label_en');
            $table->string('label_ar');
            $table->string('icon')->nullable();
            $table->string('color')->default('blue');
            $table->string('action_type'); // route, modal, api, download, custom
            $table->string('action_target')->nullable(); // Route name, modal component, API endpoint
            $table->string('confirm_message_en')->nullable();
            $table->string('confirm_message_ar')->nullable();
            $table->json('conditions')->nullable(); // Show action based on row data
            $table->json('permissions')->nullable();
            $table->boolean('is_bulk')->default(false);
            $table->boolean('is_visible')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // ===================================================================
        // DYNAMIC FORMS - النماذج الديناميكية
        // ===================================================================

        Schema::create('dynamic_forms', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name_en');
            $table->string('name_ar');
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('model_class')->nullable();
            $table->string('submit_endpoint')->nullable();
            $table->string('success_message_en')->nullable();
            $table->string('success_message_ar')->nullable();
            $table->string('redirect_after')->nullable();
            $table->json('settings');
            $table->json('roles')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('dynamic_form_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dynamic_form_id')->constrained()->onDelete('cascade');
            $table->string('section_key');
            $table->string('title_en');
            $table->string('title_ar');
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('icon')->nullable();
            $table->string('layout')->default('vertical'); // vertical, horizontal, grid
            $table->integer('columns')->default(1);
            $table->boolean('is_collapsible')->default(false);
            $table->boolean('is_collapsed')->default(false);
            $table->json('conditions')->nullable(); // Show/hide based on other fields
            $table->boolean('is_visible')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('dynamic_form_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dynamic_form_id')->constrained()->onDelete('cascade');
            $table->foreignId('section_id')->nullable()->constrained('dynamic_form_sections')->onDelete('set null');
            $table->string('field_key');
            $table->string('field_name');
            $table->string('label_en');
            $table->string('label_ar');
            $table->string('field_type'); // text, number, email, tel, textarea, select, multiselect, radio, checkbox, date, datetime, time, file, image, rich_text, color, password, hidden
            $table->string('placeholder_en')->nullable();
            $table->string('placeholder_ar')->nullable();
            $table->string('help_text_en')->nullable();
            $table->string('help_text_ar')->nullable();
            $table->text('default_value')->nullable();
            $table->json('options')->nullable();
            $table->json('data_source')->nullable();
            $table->json('validation')->nullable();
            $table->json('attributes')->nullable(); // min, max, step, rows, cols, accept, etc.
            $table->json('conditions')->nullable();
            $table->json('dependencies')->nullable(); // Fields that depend on this field
            $table->string('width')->default('full'); // full, half, third, quarter
            $table->boolean('is_required')->default(false);
            $table->boolean('is_readonly')->default(false);
            $table->boolean('is_disabled')->default(false);
            $table->boolean('is_visible')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('dynamic_form_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dynamic_form_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->json('data');
            $table->json('files')->nullable();
            $table->string('status')->default('submitted');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
        });

        // ===================================================================
        // DYNAMIC REPORTS - التقارير الديناميكية
        // ===================================================================

        Schema::create('dynamic_reports', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name_en');
            $table->string('name_ar');
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('category')->nullable();
            $table->string('report_type'); // statistics, tabular, chart, dashboard, document
            $table->json('data_source');
            $table->json('settings');
            $table->json('roles')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('dynamic_report_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dynamic_report_id')->constrained()->onDelete('cascade');
            $table->string('field_key');
            $table->string('label_en');
            $table->string('label_ar');
            $table->string('field_type'); // stat_card, data_field, calculated
            $table->string('data_field')->nullable();
            $table->string('aggregation')->nullable(); // count, sum, avg, min, max
            $table->json('filter')->nullable();
            $table->json('format')->nullable();
            $table->json('styles')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('dynamic_report_parameters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dynamic_report_id')->constrained()->onDelete('cascade');
            $table->string('param_key');
            $table->string('label_en');
            $table->string('label_ar');
            $table->string('param_type'); // text, select, date, date_range, multiselect
            $table->json('options')->nullable();
            $table->json('data_source')->nullable();
            $table->string('default_value')->nullable();
            $table->boolean('is_required')->default(false);
            $table->boolean('is_visible')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('dynamic_report_charts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dynamic_report_id')->constrained()->onDelete('cascade');
            $table->string('chart_key');
            $table->string('title_en');
            $table->string('title_ar');
            $table->string('chart_type'); // bar, line, pie, donut, area, radar, scatter
            $table->json('data_source');
            $table->json('options')->nullable();
            $table->string('width')->default('half'); // half, full, third
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('dynamic_report_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dynamic_report_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('cron_expression');
            $table->string('timezone')->default('UTC');
            $table->json('parameters')->nullable();
            $table->string('export_format')->default('pdf');
            $table->json('recipients'); // Email addresses
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_run_at')->nullable();
            $table->timestamp('next_run_at')->nullable();
            $table->string('last_status')->nullable();
            $table->timestamps();
        });

        // ===================================================================
        // PAGE CONFIGURATIONS - إعدادات الصفحات
        // ===================================================================

        Schema::create('page_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('page_key')->unique();
            $table->string('title_en');
            $table->string('title_ar');
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('icon')->nullable();
            $table->json('breadcrumbs')->nullable();
            $table->json('header_actions')->nullable(); // Buttons in header
            $table->json('components')->nullable(); // Page components order and settings
            $table->json('tabs')->nullable(); // If page has tabs
            $table->json('settings')->nullable();
            $table->json('roles')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ===================================================================
        // NOTIFICATIONS TEMPLATES - قوالب الإشعارات
        // ===================================================================

        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name_en');
            $table->string('name_ar');
            $table->string('type'); // email, sms, push, in_app
            $table->string('event')->nullable(); // Trigger event
            $table->string('subject_en')->nullable();
            $table->string('subject_ar')->nullable();
            $table->text('body_en');
            $table->text('body_ar');
            $table->json('variables')->nullable(); // Available template variables
            $table->json('settings')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ===================================================================
        // LOCALIZATION - الترجمات
        // ===================================================================

        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->string('group'); // messages, validation, pages, etc.
            $table->string('key');
            $table->string('locale', 10);
            $table->text('value');
            $table->timestamps();

            $table->unique(['group', 'key', 'locale']);
        });

        // ===================================================================
        // AUDIT LOG - سجل التدقيق
        // ===================================================================

        Schema::create('admin_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('action'); // create, update, delete, export, import
            $table->string('model_type');
            $table->unsignedBigInteger('model_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index(['model_type', 'model_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_activity_logs');
        Schema::dropIfExists('translations');
        Schema::dropIfExists('notification_templates');
        Schema::dropIfExists('page_configurations');
        Schema::dropIfExists('dynamic_report_schedules');
        Schema::dropIfExists('dynamic_report_charts');
        Schema::dropIfExists('dynamic_report_parameters');
        Schema::dropIfExists('dynamic_report_fields');
        Schema::dropIfExists('dynamic_reports');
        Schema::dropIfExists('dynamic_form_submissions');
        Schema::dropIfExists('dynamic_form_fields');
        Schema::dropIfExists('dynamic_form_sections');
        Schema::dropIfExists('dynamic_forms');
        Schema::dropIfExists('dynamic_table_actions');
        Schema::dropIfExists('dynamic_table_filters');
        Schema::dropIfExists('dynamic_table_columns');
        Schema::dropIfExists('dynamic_tables');
        Schema::dropIfExists('dashboard_layouts');
        Schema::dropIfExists('dashboard_widgets');
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('menus');
        Schema::dropIfExists('ui_layouts');
        Schema::dropIfExists('ui_themes');
        Schema::dropIfExists('system_settings');
    }
};
