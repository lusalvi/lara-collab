<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agrega hora de fin opcional a la tarea personal.
     *
     * Combinaciones posibles:
     *   - scheduled_time = null,  scheduled_end_time = null → sin horario
     *   - scheduled_time = HH:MM, scheduled_end_time = null → horario puntual
     *   - scheduled_time = HH:MM, scheduled_end_time = HH:MM → rango horario
     *
     * No se permite scheduled_end_time sin scheduled_time (se valida en el controlador).
     */
    public function up(): void
    {
        Schema::table('personal_tasks', function (Blueprint $table) {
            $table->time('scheduled_end_time')->nullable()->after('scheduled_time');
        });
    }

    public function down(): void
    {
        Schema::table('personal_tasks', function (Blueprint $table) {
            $table->dropColumn('scheduled_end_time');
        });
    }
};
