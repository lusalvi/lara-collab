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
        Schema::table('tasks', function (Blueprint $table) {
            // Se completa cuando ya se avisó (mail + notificación) que la tarea está por vencer (1 día antes).
            $table->timestamp('due_soon_notified_at')->nullable()->after('due_on');

            // Se completa cuando ya se avisó (mail + notificación) que la tarea venció.
            $table->timestamp('overdue_notified_at')->nullable()->after('due_soon_notified_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['due_soon_notified_at', 'overdue_notified_at']);
        });
    }
};