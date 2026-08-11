<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\TaskPriority\StoreTaskPriorityRequest;
use App\Http\Requests\TaskPriority\UpdateTaskPriorityRequest;
use App\Http\Resources\TaskPriorityResource;
use App\Models\TaskPriority;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador de prioridades de tareas (Settings).
 *
 * Las prioridades son globales y se ordenan por el campo `order`.
 * A diferencia de otros recursos, las prioridades se eliminan directamente
 * sin pasar por el flujo de archivado.
 */
class TaskPriorityController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(TaskPriority::class, 'task priority');
    }

    /**
     * Lista las prioridades de tareas ordenadas por su campo `order`.
     *
     * @param  Request  $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Settings/Priorities/Index', [
            'items' => TaskPriorityResource::collection(
                TaskPriority::when($request->has('archived'), fn ($query) => $query->onlyArchived())
                    ->orderBy('order')
                    ->paginate(12)
            ),
        ]);
    }

    public function create()
    {
        return Inertia::render('Settings/Priorities/Create');
    }

    /**
     * Crea una nueva prioridad de tareas.
     *
     * @param  StoreTaskPriorityRequest  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(StoreTaskPriorityRequest $request)
    {
        TaskPriority::create($request->validated());

        return redirect()->route('settings.task-priorities.index')->success('Prioridad Creada', 'Una nueva prioridad de tareas se creó con éxito.');
    }

    /**
     * Muestra el formulario de edición de una prioridad.
     *
     * @param  TaskPriority  $taskPriority
     * @return \Inertia\Response
     */
    public function edit(TaskPriority $taskPriority)
    {
        return Inertia::render('Settings/Priorities/Edit', [
            'item' => new TaskPriorityResource($taskPriority),
        ]);
    }

    /**
     * Actualiza una prioridad de tareas.
     *
     * @param  UpdateTaskPriorityRequest  $request
     * @param  TaskPriority               $taskPriority
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(UpdateTaskPriorityRequest $request, TaskPriority $taskPriority)
    {
        $taskPriority->update($request->validated());

        return redirect()->route('settings.task-priorities.index')->success('Prioridad Actualizada', 'La prioridad de tareas se actualizó con éxito.');
    }

    /**
     * Elimina una prioridad de tareas de forma permanente.
     *
     * A diferencia del resto de recursos, las prioridades no pasan por el flujo
     * de archivado; se eliminan directamente.
     *
     * @param  TaskPriority  $taskPriority
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(TaskPriority $taskPriority)
    {
        $taskPriority->delete();

        return redirect()->back()->success('Prioridad Eliminada', 'La prioridad de tareas se eliminó con éxito.');
    }
}
