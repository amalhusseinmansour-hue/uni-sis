<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['HIGH_SCHOOL_CERTIFICATE', 'ID_PASSPORT', 'PHOTO', 'OTHER']);
            $table->string('name');
            $table->string('file_path');
            $table->date('upload_date');
            $table->enum('status', ['ACCEPTED', 'REJECTED', 'UNDER_REVIEW'])->default('UNDER_REVIEW');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_documents');
    }
};
