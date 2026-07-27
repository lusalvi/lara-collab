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

            $table->enum('issue_type', [
                'Epica',
                'Historia',
                'Tarea',
                'Subtarea',
            ])
            ->default('Tarea')
            ->after('name');

            $table->foreignId('parent_task_id')
                ->nullable()
                ->after('issue_type')
                ->constrained('tasks')
                ->nullOnDelete();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {

            $table->dropForeign(['parent_task_id']);

            $table->dropColumn([
                'issue_type',
                'parent_task_id',
            ]);

        });
    }
};