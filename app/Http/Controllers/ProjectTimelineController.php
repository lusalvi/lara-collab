<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Services\PermissionService;
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
