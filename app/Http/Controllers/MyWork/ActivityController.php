<?php

namespace App\Http\Controllers\MyWork;

use App\Http\Controllers\Controller;
use App\Http\Resources\Activity\ActivityGroupedByDateCollection;
use App\Models\Activity;
use App\Models\Project;
use App\Models\User;
use App\Services\PermissionService;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador de actividad reciente del usuario (sección "Mi trabajo").
 *
 * Muestra un historial de actividades filtrado por los proyectos
 * a los que tiene acceso el usuario autenticado.
 */
class ActivityController extends Controller
{
    /**
     * Muestra las últimas 100 actividades agrupadas por fecha.
     */
    public function index(): Response
    {
        /** @var User */
        $user = auth()->user();

        $projects = PermissionService::projectsThatUserCanAccess($user);

        return Inertia::render('MyWork/Activity/Index', [
            'groupedActivities' => new ActivityGroupedByDateCollection(
                Activity::whereIn('project_id', $projects->pluck('id'))
                    ->filterByQueryString()
                    ->with([
                        'activityCapable',
                        'project',
                    ])
                    ->latest()
                    ->limit(100)
                    ->get()
            ),
            'dropdowns' => [
                // Opción "Todos los proyectos" añadida al inicio de la lista
                'projects' => Arr::prepend(
                    Project::dropdownValues(),
                    ['value' => '0', 'label' => 'Todos los proyectos']
                ),
            ],
        ]);
    }
}
