<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Services\PermissionService;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador de la vista de línea de tiempo (Gantt) del proyecto.
 *
 * Transforma las tareas en una estructura plana y normalizada para
 * que el componente React de la timeline pueda renderizarlas correctamente.
 * Las fechas se normalizan: si una tarea tiene solo `start_on` o solo `due_on`,
 * se usa el campo disponible para el otro extremo de la barra Gantt.
 */
class ProjectTimelineController extends Controller
{
    /**
     * Muestra la vista de timeline del proyecto con sus tareas formateadas.
     */
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
                'issue_type' => $task->issue_type,
                'parent_task_id' => $task->parent_task_id,
                'start_on' => $task->start_on?->toDateString() ?? $task->due_on?->toDateString(),
                'due_on' => $task->due_on?->toDateString() ?? $task->start_on?->toDateString(),
                'completed_at' => $task->completed_at?->toDateString(),
                'group_id' => $task->group_id,
                'group' => $task->taskGroup ? [
                    'id' => $task->taskGroup->id,
                    'name' => $task->taskGroup->name,
                    'color' => $task->taskGroup->color,
                ] : null,
                'assigned_to_user_id' => $task->assigned_to_user_id,
                'assigned_to_user' => $task->assignedToUser,
                'priority' => $task->priority,
            ])
            ->values();

        return Inertia::render('Projects/Timeline/Index', [
            'project' => $project,
            'tasks' => $tasks,
            'taskGroups' => $project->taskGroups()->get(['id', 'name', 'color']),
            'usersWithAccessToProject' => PermissionService::usersWithAccessToProject($project),
        ]);
    }
}
