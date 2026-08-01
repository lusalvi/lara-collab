<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Notifications\TaskOverdueNotification;
use Illuminate\Console\Command;

class NotifyTasksOverdue extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'task:notify-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Notify (mail + database) assigned users about overdue tasks. Sent only once per task.';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $count = 0;

        Task::query()
            ->overduePendingNotification()
            ->with('assignedToUser', 'project')
            ->chunkById(100, function ($tasks) use (&$count) {
                foreach ($tasks as $task) {
                    if (! $task->assignedToUser) {
                        continue;
                    }

                    $task->assignedToUser->notify(new TaskOverdueNotification($task));
                    $task->update(['overdue_notified_at' => now()]);

                    $count++;
                }
            });

        $this->info("Notified {$count} overdue task(s).");
    }
}
