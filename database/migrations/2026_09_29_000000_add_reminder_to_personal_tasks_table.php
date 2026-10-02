<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Recordatorio interno opcional para tareas personales.
     *
     *   - reminder_minutes      → minutos de anticipación elegidos (5, 15, 30, 60). null = sin recordatorio.
     *   - remind_at             → momento exacto en que corresponde notificar (hora de comienzo - anticipación).
     *                             null si no hay recordatorio o si el momento ya había pasado al guardar.
     *   - reminder_notified_at  → cuándo se envió la notificación (evita duplicados).
     */
    public function up(): void
    {
        Schema::table('personal_tasks', function (Blueprint $table) {
            $table->unsignedTinyInteger('reminder_minutes')->nullable()->after('scheduled_end_time');
            $table->dateTime('remind_at')->nullable()->after('reminder_minutes');
            $table->dateTime('reminder_notified_at')->nullable()->after('remind_at');

            $table->index('remind_at');
        });
    }

    public function down(): void
    {
        Schema::table('personal_tasks', function (Blueprint $table) {
            $table->dropIndex(['remind_at']);
            $table->dropColumn(['reminder_minutes', 'remind_at', 'reminder_notified_at']);
        });
    }
};
