<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador de la vista de calendario del proyecto.
 *
 * Devuelve todas las tareas con fecha de vencimiento asignada,
 * con los datos necesarios para renderizarlas en el calendario.
 */
class ProjectCalendarController extends Controller
{
    /**
     * Muestra el calendario del proyecto con sus tareas.
     *
     * Solo incluye tareas que tienen `due_on` definido, ya que sin fecha
     * no tienen posición en el calendario.
     *
     * @param  Project  $project
     * @return Response
     */
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
