<?php

namespace App\Observers;

use App\Models\Task;

class TaskObserver
{
    /**
     * Handle the Task "created" event.
     */
    public function created(Task $task): void
    {
        $task->activities()->create([
            'project_id' => $task->project_id,
            'user_id' => auth()->id(),
            'title' => 'Nueva actividad',
            'subtitle' => "La actividad \"{$task->name}\" fue creada por ".auth()->user()->name,
        ]);

        if ($task->assigned_to_user_id !== null) {
            $task->assigned_at = now();
            $task->saveQuietly();
        }
    }

    /**
     * Handle the Task "updated" event.
     */
    public function updated(Task $task): void
    {
        if ($task->isDirty('name')) {
            $task->activities()->create([
                'project_id' => $task->project_id,
                'user_id' => auth()->id(),
                'title' => 'Nombre de la actividad actualizado',
                'subtitle' => "Se cambió de \"{$task->getOriginal('name')}\" a \"{$task->name}\" por ".auth()->user()->name,
            ]);
        }
        if ($task->isDirty('description')) {
            $task->activities()->create([
                'project_id' => $task->project_id,
                'user_id' => auth()->id(),
                'title' => 'Descripción de la actividad actualizada',
                'subtitle' => "Se actualizó la descripción de la actividad \"{$task->name}\" por ".auth()->user()->name,
            ]);
        }
        if ($task->isDirty('assigned_to_user_id')) {
            $task->activities()->create([
                'project_id' => $task->project_id,
                'user_id' => auth()->id(),
                'title' => $task->assigned_to_user_id ? 'Usuario asignado' : 'Usuario desasignado',
                'subtitle' => $task->assigned_to_user_id
                    ? "La actividad \"{$task->name}\" fue asignada a {$task->assignedToUser->name} por ".auth()->user()->name
                    : "Se desasignó el usuario de la actividad \"{$task->name}\" por ".auth()->user()->name,
            ]);

            $task->assigned_at = now();
            $task->saveQuietly();
        }
        if ($task->isDirty('due_on')) {
            $task->activities()->create([
                'project_id' => $task->project_id,
                'user_id' => auth()->id(),
                'title' => $task->due_on ? 'Fecha de vencimiento agregada' : 'Fecha de vencimiento eliminada',
                'subtitle' => $task->due_on
                    ? "La fecha de vencimiento se estableció para el {$task->due_on->locale('es')->translatedFormat('j \d\e F \d\e Y')} en la actividad \"{$task->name}\" por ".auth()->user()->name
                    : "Se eliminó la fecha de vencimiento de la actividad \"{$task->name}\" por ".auth()->user()->name,
            ]);
        }
        if ($task->isDirty('completed_at')) {
            $task->activities()->create([
                'project_id' => $task->project_id,
                'user_id' => auth()->id(),
                'title' => $task->completed_at ? 'Actividad completada' : 'Actividad marcada como incompleta',
                'subtitle' => "La actividad \"{$task->name}\" fue marcada como ".($task->completed_at ? 'completada' : 'incompleta').' por '.auth()->user()->name,
            ]);
        }
    }

    /**
     * Handle the Project "archived" event.
     */
    public function archived(Task $task): void
    {
        $task->activities()->create([
            'project_id' => $task->project_id,
            'user_id' => auth()->id(),
            'title' => 'Actividad archivada',
            'subtitle' => "La actividad \"{$task->name}\" fue archivada por ".auth()->user()->name,
        ]);
    }

    /**
     * Handle the Project "unArchived" event.
     */
    public function unArchived(Task $task): void
    {
        $task->activities()->create([
            'project_id' => $task->project_id,
            'user_id' => auth()->id(),
            'title' => 'Actividad desarchivada',
            'subtitle' => "La actividad \"{$task->name}\" fue desarchivada por ".auth()->user()->name,
        ]);
    }
}
