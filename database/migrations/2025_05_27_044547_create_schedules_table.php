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
            $table->string('room')->default('Computer Lab 225');
            $table->enum('type', ['lecture', 'reservation']);
            $table->unsignedBigInteger('reservation_id')->nullable();
            $table->timestamps();
            $table->foreign('lecturer_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('reservation_id')->references('id')->on('reservations')->onDelete('set null');
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
