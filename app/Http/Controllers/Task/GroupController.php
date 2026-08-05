<?php

namespace App\Http\Controllers\Task;

use App\Events\TaskGroup\TaskGroupCreated;
use App\Events\TaskGroup\TaskGroupDeleted;
use App\Events\TaskGroup\TaskGroupOrderChanged;
use App\Events\TaskGroup\TaskGroupRestored;
use App\Events\TaskGroup\TaskGroupUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\TaskGroup\StoreTaskGroupRequest;
use App\Http\Requests\TaskGroup\UpdateTaskGroupRequest;
use App\Models\Project;
use App\Models\TaskGroup;
use App\Services\ForceDeleteService;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    public function store(StoreTaskGroupRequest $request, Project $project)
    {
        $this->authorize('create', [TaskGroup::class, $project]);

        $taskGroup = $project->taskGroups()->create($request->validated());

        TaskGroupCreated::dispatch($taskGroup);

        return redirect()->route('projects.tasks', $project)->success('Estado Creado', 'Un nuevo estado de tareas se creó con éxito.');
    }

    public function update(UpdateTaskGroupRequest $request, Project $project, TaskGroup $taskGroup)
    {
        $this->authorize('update', [$taskGroup, $project]);

        $taskGroup->update($request->validated());

        TaskGroupUpdated::dispatch($taskGroup);

        return redirect()->route('projects.tasks', $project)->success('Estado Actualizado', 'El estado de tareas se actualizó con éxito.');
    }

    public function destroy(Project $project, TaskGroup $taskGroup)
    {
        $this->authorize('delete', [$taskGroup, $project]);

        if ($taskGroup->tasks->isNotEmpty()) {
            return redirect()->route('projects.tasks', $project)->warning('Acción Detenida', 'No es posible archivar un estado de tareas que contiene tareas asociadas.');
        }

        $taskGroup->update(['archived_by_id' => auth()->id()]);
        $taskGroup->archive();

        TaskGroupDeleted::dispatch($taskGroup->id, $project->id);

        return redirect()->route('projects.tasks', $project)->success('Estado Archivado', 'El estado de tareas se archivó con éxito.');
    }

    public function restore(Project $project, int $taskGroupId)
    {
        $taskGroup = TaskGroup::withArchived()->findOrFail($taskGroupId);

        $this->authorize('restore', [$taskGroup, $project]);

        $taskGroup->unArchive();
        $taskGroup->update(['archived_by_id' => null]);

        TaskGroupRestored::dispatch($taskGroup);

        return redirect()->back()->success('Estado Restaurado', 'La restauración del estado de tareas se realizó con éxito.');
    }

    public function reorder(Request $request, Project $project)
    {
        $this->authorize('reorder', [TaskGroup::class, $project]);

        TaskGroup::setNewOrder($request->ids);

        TaskGroupOrderChanged::dispatch($project->id, $request->ids);

        return response()->json();
    }

    public function bulkForceDelete(Request $request, Project $project, ForceDeleteService $forceDeleteService)
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:task_groups,id'],
        ]);

        $taskGroups = TaskGroup::onlyArchived()
            ->whereIn('id', $request->ids)
            ->where('project_id', $project->id)
            ->get();

        foreach ($taskGroups as $taskGroup) {
            $this->authorize('forceDelete', [$taskGroup, $project]);
        }

        $deletedCount = $forceDeleteService->forceDeleteTaskGroups($taskGroups);

        return redirect()->route('projects.tasks', $project)->success(
            'Estado Eliminado',
            "{$deletedCount} estado(s) de tareas fueron eliminados permanentemente."
        );
    }
}
