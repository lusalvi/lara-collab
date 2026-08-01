<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Notifications\TaskDueSoonNotification;
use Illuminate\Console\Command;

class NotifyTasksDueSoon extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'task:notify-due-soon';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Notify (mail + database) assigned users about tasks due tomorrow. Sent only once per task.';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $count = 0;

        Task::query()
            ->dueSoonPendingNotification()
            ->with('assignedToUser', 'project')
            ->chunkById(100, function ($tasks) use (&$count) {
                foreach ($tasks as $task) {
                    if (! $task->assignedToUser) {
                        continue;
                    }

                    $task->assignedToUser->notify(new TaskDueSoonNotification($task));
                    $task->update(['due_soon_notified_at' => now()]);

                    $count++;
                }
            });

        $this->info("Notified {$count} task(s) due tomorrow.");
    }
}
