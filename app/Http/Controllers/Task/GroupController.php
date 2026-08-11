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

/**
 * Controlador de grupos de tareas (columnas del Kanban / estados).
 *
 * Gestiona la creación, edición, archivado, restauración, reordenamiento
 * y eliminación permanente de grupos de tareas dentro de un proyecto.
 * Cada cambio dispara un evento para mantener sincronizados los clientes
 * conectados en tiempo real.
 */
class GroupController extends Controller
{
    /**
     * Crea un nuevo grupo de tareas en el proyecto.
     *
     * @param  StoreTaskGroupRequest  $request
     * @param  Project                $project
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(StoreTaskGroupRequest $request, Project $project)
    {
        /**
     * Actualiza los datos de un grupo de tareas.
     *
     * @param  UpdateTaskGroupRequest  $request
     * @param  Project                 $project
     * @param  TaskGroup               $taskGroup
     * @return \Illuminate\Http\RedirectResponse
     */
        $this->authorize('create', [TaskGroup::class, $project]);

        $taskGroup = $project->taskGroups()->create($request->validated());

        TaskGroupCreated::dispatch($taskGroup);

        return redirect()->route('projects.tasks', $project)->success('Estado Creado', 'Un nuevo estado de tareas se creó con éxito.');
    }

    public function update(UpdateTaskGroupRequest $request, Project $project, TaskGroup $taskGroup)
    {
        /**
     * Archiva un grupo de tareas.
     *
     * Bloquea el archivado si el grupo todavía contiene tareas asociadas.
     *
     * @param  Project    $project
     * @param  TaskGroup  $taskGroup
     * @return \Illuminate\Http\RedirectResponse
     */
        $this->authorize('update', [$taskGroup, $project]);

        $taskGroup->update($request->validated());

        TaskGroupUpdated::dispatch($taskGroup);

        return redirect()->route('projects.tasks', $project)->success('Estado Actualizado', 'El estado de tareas se actualizó con éxito.');
    }

    public function destroy(Project $project, TaskGroup $taskGroup)
    {
        $this->authorize('delete', [$taskGroup, $project]);

        // No se puede archivar un grupo que tiene tareas activas
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
        /**
     * Restaura un grupo de tareas archivado.
     *
     * @param  Project  $project
     * @param  int      $taskGroupId
     * @return \Illuminate\Http\RedirectResponse
     */
        $taskGroup = TaskGroup::withArchived()->findOrFail($taskGroupId);

        $this->authorize('restore', [$taskGroup, $project]);

        $taskGroup->unArchive();
        $taskGroup->update(['archived_by_id' => null]);

        TaskGroupRestored::dispatch($taskGroup);

        return redirect()->back()->success('Estado Restaurado', 'La restauración del estado de tareas se realizó con éxito.');
    }

    public function reorder(Request $request, Project $project)
    {
        /**
     * Reordena los grupos de tareas (drag & drop entre columnas del Kanban).
     *
     * @param  Request  $request  Contiene: ids (array de IDs en el nuevo orden).
     * @param  Project  $project
     * @return \Illuminate\Http\JsonResponse
     */
        $this->authorize('reorder', [TaskGroup::class, $project]);

        TaskGroup::setNewOrder($request->ids);

        TaskGroupOrderChanged::dispatch($project->id, $request->ids);

        return response()->json();
    }

    public function bulkForceDelete(Request $request, Project $project, ForceDeleteService $forceDeleteService)
    {
        /**
     * Elimina permanentemente un lote de grupos de tareas archivados.
     *
     * Solo procesa grupos pertenecientes al proyecto indicado.
     *
     * @param  Request             $request            Contiene: ids (array de IDs a eliminar).
     * @param  Project             $project
     * @param  ForceDeleteService  $forceDeleteService
     * @return \Illuminate\Http\RedirectResponse
     */
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
