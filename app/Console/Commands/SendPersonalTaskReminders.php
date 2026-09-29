<?php

namespace App\Console\Commands;

use App\Models\PersonalTask;
use App\Notifications\PersonalTaskReminderNotification;
use Illuminate\Console\Command;

class SendPersonalTaskReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'personal-task:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send internal (database + broadcast) reminders for personal tasks whose reminder time has arrived. Sent only once per task.';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        // Recordatorios que quedaron fuera de la tolerancia (scheduler caído, etc.): se
        // descartan para no enviar avisos atrasados. La tarea y su configuración se conservan.
        $expired = PersonalTask::query()
            ->reminderExpired()
            ->update(['remind_at' => null]);

        $count = 0;

        PersonalTask::query()
            ->reminderDue()
            ->with(['user', 'priority'])
            ->chunkById(100, function ($tasks) use (&$count) {
                foreach ($tasks as $task) {
                    // Se "reclama" el envío de forma atómica: si otra ejecución ya lo tomó, se omite.
                    $claimed = PersonalTask::query()
                        ->whereKey($task->id)
                        ->whereNull('reminder_notified_at')
                        ->update(['reminder_notified_at' => now()]);

                    if (! $claimed || ! $task->user) {
                        continue;
                    }

                    $task->user->notify(new PersonalTaskReminderNotification($task));

                    $count++;
                }
            });

        $this->info("Sent {$count} personal task reminder(s). Discarded {$expired} expired.");
    }
}
