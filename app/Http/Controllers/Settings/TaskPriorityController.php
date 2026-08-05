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

class TaskPriorityController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(TaskPriority::class, 'task priority');
    }

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

    public function store(StoreTaskPriorityRequest $request)
    {
        TaskPriority::create($request->validated());

        return redirect()->route('settings.task-priorities.index')->success('Prioridad Creada', 'Una nueva prioridad de tareas se creó con éxito.');
    }

    public function edit(TaskPriority $taskPriority)
    {
        return Inertia::render('Settings/Priorities/Edit', [
            'item' => new TaskPriorityResource($taskPriority),
        ]);
    }

    public function update(UpdateTaskPriorityRequest $request, TaskPriority $taskPriority)
    {
        $taskPriority->update($request->validated());

        return redirect()->route('settings.task-priorities.index')->success('Prioridad Actualizada', 'La prioridad de tareas se actualizó con éxito.');
    }

    public function destroy(TaskPriority $taskPriority)
    {
        $taskPriority->delete();

        return redirect()->back()->success('Prioridad Eliminada', 'La prioridad de tareas se eliminó con éxito.');
    }
}
