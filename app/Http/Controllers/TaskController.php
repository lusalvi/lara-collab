<?php

namespace App\Http\Controllers;

use App\Actions\Task\CreateTask;
use App\Actions\Task\UpdateTask;
use App\Events\Task\TaskDeleted;
use App\Events\Task\TaskGroupChanged;
use App\Events\Task\TaskOrderChanged;
use App\Events\Task\TaskRestored;
use App\Events\Task\TaskUpdated;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskPriorityResource;
use App\Models\Label;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskGroup;
use App\Models\TaskPriority;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request, Project $project, ?Task $task = null): Response
    {
        $this->authorize('viewAny', [Task::class, $project]);

        $groups = $project
            ->taskGroups()
            ->when($request->has('archived'), fn ($query) => $query->onlyArchived())
            ->get();

        $groupedTasks = $project
            ->taskGroups()
            ->with(['project' => fn ($query) => $query->withArchived()])
            ->get()
            ->mapWithKeys(function (TaskGroup $group) use ($request, $project) {
                $prioritySort = data_get($request->input('sort', []), 'priority');

                return [
                    $group->id => Task::where('project_id', $project->id)
                        ->where('group_id', $group->id)
                        ->searchByQueryString()
                        ->filterByQueryString()
                        ->when($request->has('archived'), fn ($query) => $query->onlyArchived())
                        ->withDefault()
                        ->when($project->isArchived(), fn ($query) => $query->with(['project' => fn ($query) => $query->withArchived()]))
                        ->when($prioritySort, function ($query, $direction) {
                            $direction = $direction === 'asc' ? 'asc' : 'desc';

                            $query
                                ->leftJoin('task_priorities', 'tasks.priority_id', '=', 'task_priorities.id')
                                ->orderByRaw('tasks.priority_id IS NULL')
                                ->orderBy('task_priorities.order', $direction)
                                ->orderByDesc('tasks.created_at')
                                ->select('tasks.*');
                        }, function ($query) {
                            $query->orderByDesc('created_at');
                        })
                        ->get(),
                ];
            });

        return Inertia::render('Projects/Tasks/Index', [
            'project' => $project,
            'usersWithAccessToProject' => PermissionService::usersWithAccessToProject($project),
            'labels' => Label::get(['id', 'name', 'color']),
            'priorities' => TaskPriorityResource::collection(TaskPriority::orderBy('order')->get()),
            'taskGroups' => $groups,
            'groupedTasks' => $groupedTasks,
            'openedTask' => $task ? $task->loadDefault() : null,
        ]);
    }

    public function store(StoreTaskRequest $request, Project $project): RedirectResponse
    {
        $this->authorize('create', [Task::class, $project]);

        (new CreateTask)->create($project, $request->validated());

        return redirect()->route('projects.tasks', $project)->success('Task added', 'A new task was successfully added.');
    }

    public function update(UpdateTaskRequest $request, Project $project, Task $task): JsonResponse
    {
        $this->authorize('update', [$task, $project]);

        (new UpdateTask)->update($task, $request->validated());

        return response()->json();
    }

    public function reorder(Request $request, Project $project): JsonResponse
    {
        $this->authorize('reorder', [Task::class, $project]);

        Task::setNewOrder($request->ids);

        TaskOrderChanged::dispatch(
            $project->id,
            $request->group_id,
            $request->from_index,
            $request->to_index,
        );

        return response()->json();
    }

    public function move(Request $request, Project $project): JsonResponse
    {
        $this->authorize('reorder', [Task::class, $project]);

        Task::setNewOrder($request->ids);
        $toGroup = TaskGroup::find($request->to_group_id);
        $isCompletedGroup = $toGroup && $toGroup->name === 'Finalizado';

        Task::whereIn('id', $request->ids)->update([
            'group_id' => $request->to_group_id,
            'completed_at' => $isCompletedGroup ? now() : null,
        ]);

        TaskGroupChanged::dispatch(
            $project->id,
            $request->from_group_id,
            $request->to_group_id,
            $request->from_index,
            $request->to_index,
        );

        return response()->json();
    }

    public function reparent(Request $request, Project $project): JsonResponse
    {
        $this->authorize('reorder', [Task::class, $project]);

        $request->validate([
            'task_id' => ['required', 'exists:tasks,id'],
            'parent_task_id' => ['nullable', 'exists:tasks,id'],
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:tasks,id'],
        ]);

        $task = Task::findOrFail($request->task_id);

        if ($request->parent_task_id) {
            if ((int) $request->parent_task_id === $task->id) {
                return response()->json(['message' => 'A task cannot be its own parent.'], 422);
            }

            $newParent = Task::findOrFail($request->parent_task_id);

            if (! $newParent->canHaveChildOfType($task->issue_type)) {
                return response()->json([
                    'message' => "A {$newParent->issue_type} cannot have a {$task->issue_type} as a child.",
                ], 422);
            }

            // Evita crear un ciclo: el nuevo padre no puede ser un descendiente de la tarea que se mueve.
            $ancestor = $newParent;
            while ($ancestor) {
                if ($ancestor->id === $task->id) {
                    return response()->json(['message' => 'Cannot move a task inside its own descendant.'], 422);
                }
                $ancestor = $ancestor->parent;
            }
        }

        $task->update(['parent_task_id' => $request->parent_task_id]);

        Task::setNewOrder($request->ids);

        return response()->json();
    }

    public function complete(Request $request, Project $project, Task $task): JsonResponse
    {
        $this->authorize('complete', [Task::class, $project]);

        $task->update([
            'completed_at' => ($request->completed === true) ? now() : null,
        ]);
        TaskUpdated::dispatch($task, 'completed_at');

        return response()->json();
    }

    public function destroy(Project $project, Task $task): RedirectResponse
    {
        $this->authorize('delete', [$task, $project]);

        $task->archiveWithChildren(auth()->id());
        TaskDeleted::dispatch($task->id, $task->project_id);

        return redirect()->back()->success('Task archived', 'The task was successfully archived.');
    }

    public function restore(Project $project, Task $task)
    {

        $this->authorize('restore', [$task, $project]);

        $task->restoreWithChildren();
        TaskRestored::dispatch($task);

        return redirect()->back()->success('Task restored', 'The restoring of the Task was completed successfully.');
    }

    public function bulkArchive(Request $request, Project $project): JsonResponse
    {
        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:tasks,id'],
        ]);

        // Obtener las tareas a archivar
        $tasksToArchive = Task::whereIn('id', $request->ids)
            ->where('project_id', $project->id)
            ->get();

        // Verificar autorización - la política espera Task Y Project
        if ($tasksToArchive->isNotEmpty()) {
            $this->authorize('delete', [$tasksToArchive->first(), $project]);
        }

        // Archivar cada tarea
        $tasksToArchive->each(function ($task) {
            $task->archiveWithChildren();
            TaskDeleted::dispatch($task->id, $task->project_id);
        });

        return response()->json(['message' => 'Tasks archived successfully']);
    }
}