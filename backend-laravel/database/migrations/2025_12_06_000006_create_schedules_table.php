<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('semester_id')->constrained()->onDelete('cascade');
            $table->enum('day', ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']);
            $table->time('start_time');
            $table->time('end_time');
            $table->string('room')->nullable();
            $table->string('building')->nullable();
            $table->string('instructor')->nullable();
            $table->string('section')->nullable();
            $table->timestamps();

            // Unique constraint to prevent room conflicts
            $table->unique(['semester_id', 'day', 'start_time', 'room'], 'unique_room_schedule');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
