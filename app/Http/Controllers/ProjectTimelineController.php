<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Inertia\Inertia;
use Inertia\Response;

class ProjectTimelineController extends Controller
{
    public function index(Project $project): Response
    {
        $this->authorize('viewAny', [Task::class, $project]);

        $tasks = $project
            ->tasks()
            ->with([
                'assignedToUser:id,name,avatar',
                'priority:id,label,color,order',
                'taskGroup:id,name,color',
            ])
            ->orderBy('start_on')
            ->get()
            ->map(fn (Task $task) => [
                'id' => $task->id,
                'number' => $task->number,
                'name' => $task->name,
                // El gantt necesita un rango de fechas: si falta start_on
                // usamos due_on (o viceversa) para no perder la tarea del cronograma.
                'start_on' => $task->start_on?->toDateString() ?? $task->due_on?->toDateString(),
                'due_on' => $task->due_on?->toDateString() ?? $task->start_on?->toDateString(),
                'completed_at' => $task->completed_at?->toDateString(),
                'status' => $task->completed_at ? 'done' : ($task->start_on && $task->start_on->isPast() ? 'in_progress' : 'todo'),
                'group' => $task->taskGroup ? [
                    'id' => $task->taskGroup->id,
                    'name' => $task->taskGroup->name,
                    'color' => $task->taskGroup->color,
                ] : null,
                'assigned_to_user' => $task->assignedToUser,
                'priority' => $task->priority,
            ])
            ->values();

        return Inertia::render('Projects/Timeline/Index', [
            'project' => $project,
            'tasks' => $tasks,
        ]);
    }
}
