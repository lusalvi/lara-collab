<?php

namespace App\Http\Controllers\MyWork;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador de tareas propias del usuario (sección "Mi trabajo").
 *
 * Muestra las tareas pendientes asignadas al usuario autenticado,
 * agrupadas por proyecto, con soporte de ordenamiento por prioridad.
 */
class MyWorkTaskController extends Controller
{
    /**
     * Muestra las tareas pendientes asignadas al usuario, agrupadas por proyecto.
     *
     * Soporta ordenamiento por prioridad (`sort_priority=asc|desc`).
     * Las tareas sin prioridad asignada siempre se ubican al final.
     *
     * @param  Request  $request  Puede contener: sort_priority (asc|desc).
     */
    public function index(Request $request): Response
    {
        /** @var User */
        $user = auth()->user();

        $projects = PermissionService::projectsThatUserCanAccess($user);

        $prioritySort = $request->input('sort_priority');

        return Inertia::render('MyWork/Tasks/Index', [
            'projects' => Project::whereIn('id', $projects->pluck('id'))
                ->with([
                    'area:id,name',
                    'tasks' => function ($query) use ($user, $prioritySort) {
                        $query->where('assigned_to_user_id', $user->id)
                            ->whereNull('completed_at')
                            ->withoutGlobalScope('ordered')
                            ->when($prioritySort, function ($query, $direction) {
                                // Ordenamiento por prioridad con NULLs siempre al final,
                                // luego por fecha de vencimiento como criterio secundario.
                                $direction = $direction === 'asc' ? 'asc' : 'desc';

                                $query
                                    ->leftJoin('task_priorities', 'tasks.priority_id', '=', 'task_priorities.id')
                                    ->orderByRaw('tasks.priority_id IS NULL')
                                    ->orderBy('task_priorities.order', $direction)
                                    ->orderByRaw('-tasks.due_on DESC')
                                    ->select('tasks.*');
                            }, function ($query) {
                                $query->orderByRaw('-due_on DESC');
                            })
                            ->with([
                                'labels:id,name,color',
                                'assignedToUser:id,name',
                                'taskGroup:id,name',
                            ]);
                    },
                ])
                ->withExists('favoritedByAuthUser AS favorite')
                ->orderBy('favorite', 'desc')
                ->orderBy('name', 'asc')
                ->get(),
        ]);
    }
}
