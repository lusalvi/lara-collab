<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Inertia\Inertia;
use Inertia\Response;

class ProjectCalendarController extends Controller
{
    public function index(Project $project): Response
    {
        $this->authorize('viewAny', [Task::class, $project]);

        $tasks = $project
            ->tasks()
            ->whereNotNull('due_on')
            ->with([
                'assignedToUser:id,name,avatar',
                'priority:id,label,color,order',
                'taskGroup:id,name',
            ])
            ->get();

        return Inertia::render('Projects/Calendar/Index', [
            'project' => $project,
            'tasks' => $tasks,
        ]);
    }
}
