<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('auth:clear-resets')->everyFifteenMinutes();

        $schedule->command('project:prune-activities')->dailyAt('03:00');
        $schedule->command('user:prune-notifications')->dailyAt('03:05');

        /* Tareas vencidas: se detecta a penas cambia el dia, se notifica una sola vez */
        $schedule->command('task:notify-overdue')->dailyAt('00:10');
        /* Tareas que vencen al dia siguiente:se avisa una sola vez, un dia antes */
        $schedule->command('task:notify-due-soon')->dailyAt('09:00');

    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
