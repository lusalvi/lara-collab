<?php

namespace App\Actions\Task;

use App\Events\Task\TaskUpdated;
use App\Models\Task;
use App\Models\TaskGroup;

/**
 * Acción responsable de actualizar un campo específico de una tarea.
 *
 * El diseño de esta acción asume que cada llamada actualiza un único campo
 * a la vez (el primer key del array $data), lo que simplifica la lógica
 * de eventos y efectos secundarios por campo.
 */
class UpdateTask
{
    /**
     * Actualiza la tarea con el campo provisto en $data.
     *
     * Maneja casos especiales:
     * - `group_id`: al mover al grupo "Finalizado" marca completed_at; al salir, lo limpia.
     *   Además resetea el orden (order_column = 0) para que aparezca al inicio del grupo.
     * - `subscribed_users`: sincroniza la tabla pivote en lugar de actualizar la fila de la tarea.
     * - `labels`: ídem para etiquetas.
     *
     * @param  Task  $task  Tarea a actualizar.
     * @param  array  $data  Array con exactamente un par clave-valor (campo => nuevo valor).
     */
    public function update(Task $task, array $data): void
    {
        // Detectar qué campo se está actualizando
        $updateField = key($data);

        // Los campos de relaciones muchos-a-muchos se sincronizan aparte;
        // el resto se guarda directamente en la fila de la tarea
        if (! in_array($updateField, ['subscribed_users', 'labels'])) {

            if ($updateField === 'group_id') {
                $toGroup = TaskGroup::find($data['group_id']);

                // Marcar como completada solo si el grupo destino se llama "Finalizado"
                $data['completed_at'] = ($toGroup && $toGroup->name === 'Finalizado')
                    ? now()
                    : null;
            }

            $task->update($data);

            // Al cambiar de grupo, resetear el orden para que la tarea
            // aparezca al inicio (orden 0) en el nuevo grupo
            if ($updateField === 'group_id') {
                $task->update(['order_column' => 0]);
            }
        }

        // Sincronizar suscriptores (tabla pivote subscribe_task)
        if ($updateField === 'subscribed_users') {
            $task->subscribedUsers()->sync($data['subscribed_users']);
        }

        // Sincronizar etiquetas (tabla pivote label_task)
        if ($updateField === 'labels') {
            $task->labels()->sync($data['labels']);
        }

        TaskUpdated::dispatch($task, $updateField);
    }
}
