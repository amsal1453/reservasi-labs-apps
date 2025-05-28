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
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->enum('day', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
            $table->time('start_time');
            $table->time('end_time');
            $table->string('course_name')->nullable();
            $table->unsignedBigInteger('lecturer_id')->nullable();
            $table->enum('type', ['lecture', 'reservation']);
            $table->foreignId('reservation_id')->nullable()->constrained('reservations')->nullOnDelete();
            $table->foreignId('lab_id')->constrained('labs')->onDelete('cascade');
            $table->timestamps();

            $table->foreign('lecturer_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
