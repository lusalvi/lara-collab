<?php

namespace App\Observers;

use App\Models\PersonalTask;

class PersonalTaskObserver
{
    /**
     * Recalcula el recordatorio cuando se crea la tarea o cambia la fecha, la hora de
     * comienzo o la anticipación. Otras ediciones (título, notas, completar) no lo tocan.
     */
    public function saving(PersonalTask $task): void
    {
        if ($task->exists && ! $this->reminderInputsChanged($task)) {
            return;
        }

        $task->syncReminder();
    }

    private function reminderInputsChanged(PersonalTask $task): bool
    {
        // La BD devuelve la hora como HH:MM:SS y el formulario la envía como HH:MM:
        // se compara siempre como HH:MM para que reenviar la misma hora no cuente como cambio.
        $hhmm = fn ($time) => $time ? substr((string) $time, 0, 5) : null;

        if ($hhmm($task->getOriginal('scheduled_time')) !== $hhmm($task->scheduled_time)) {
            return true;
        }

        return $task->isDirty(['scheduled_for', 'reminder_minutes']);
    }
}
