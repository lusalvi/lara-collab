<?php

namespace App\Notifications;

use App\Models\PersonalTask;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

/**
 * Recordatorio interno de una tarea personal (sin email).
 *
 * Se entrega por `database` (campana / listado) y `broadcast` (toast en vivo),
 * igual que el resto de las notificaciones internas. No se encola: el aviso debe
 * salir a tiempo y no depender del worker.
 */
class PersonalTaskReminderNotification extends Notification
{
    use Queueable;

    public function __construct(public PersonalTask $task) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $task = $this->task;

        $lead = $task->reminder_minutes === 60 ? '1 hora' : "{$task->reminder_minutes} minutos";

        $start = substr($task->scheduled_time, 0, 5);
        $time = $task->scheduled_end_time
            ? $start.' – '.substr($task->scheduled_end_time, 0, 5)
            : $start;

        $priority = $task->priority ? "Prioridad {$task->priority->label}" : 'Sin prioridad';

        return [
            'personal_task_id' => $task->id,
            'title' => "En {$lead}: ".Str::limit($task->description, 80),
            'subtitle' => "Recordatorio · {$time} · {$priority}",
            'link' => route('personal-tasks.index', ['date' => $task->scheduled_for->toDateString()]),
        ];
    }
}
