<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\Project\ProjectResource;
use App\Models\Area;
use App\Models\Project;
use App\Models\User;
use App\Services\ForceDeleteService;
use App\Services\ProjectService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador de proyectos.
 *
 * Gestiona el ciclo de vida de los proyectos: listado con filtros de acceso por rol,
 * creación con grupos de tareas por defecto, edición, archivado, restauración,
 * eliminación permanente, favoritos y control de acceso por usuario.
 */
class ProjectController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Project::class, 'project');
    }

    /**
     * Muestra el listado de proyectos según el rol del usuario autenticado.
     *
     * - Superadmin: ve todos los proyectos.
     * - Admin de área: ve solo los proyectos de su área.
     * - Usuario regular: ve solo los proyectos de su área en los que está asignado.
     *
     * Incluye conteos de tareas totales, completadas y vencidas, y marca favoritos.
     *
     * @param  Request  $request  Puede contener: search, archived.
     * @return Response
     */
    public function index(Request $request)
    {
        /** @var User $authUser */
        $authUser = $request->user();

        return Inertia::render('Projects/Index', [
            'items' => ProjectResource::collection(
                Project::searchByQueryString()
                    // Superadmin ve todos; admin de área ve los de su área; resto solo los asignados
                    ->when($authUser->isSuperAdmin(), fn ($q) => $q) // sin filtro adicional
                    ->when(
                        $authUser->isAdmin() && ! $authUser->isSuperAdmin(),
                        fn ($q) => $q->where('area_id', $authUser->area_id)
                    )
                    ->when(
                        $authUser->isNotAdmin(),
                        fn ($q) => $q->whereHas('users', fn ($q2) => $q2->where('id', $authUser->id))
                            ->where('area_id', $authUser->area_id)
                    )
                    ->when($request->has('archived'), fn ($query) => $query->onlyArchived())
                    ->with(['area:id,name', 'users:id,name,avatar'])
                    ->withCount([
                        'tasks AS all_tasks_count',
                        'tasks AS completed_tasks_count' => fn ($q) => $q->whereNotNull('completed_at'),
                        'tasks AS overdue_tasks_count' => fn ($q) => $q->whereNull('completed_at')->whereDate('due_on', '<', now()),
                    ])
                    ->withExists('favoritedByAuthUser AS favorite')
                    ->orderBy('favorite', 'desc')
                    ->orderBy('name', 'asc')
                    ->get()
            ),
        ]);
    }

    /**
     * Muestra el formulario de creación de proyecto.
     *
     * Los dropdowns de áreas y usuarios se filtran según el rol del usuario:
     * - Superadmin: ve todas las áreas y todos los usuarios.
     * - Admin de área: ve solo su área y los usuarios de la misma.
     *
     * @return Response
     */
    public function create()
    {
        /** @var User $authUser */
        $authUser = auth()->user();

        return Inertia::render('Projects/Create', [
            'dropdowns' => [
                // Superadmin ve todas las áreas; admin de área solo ve la suya
                'areas' => $authUser->isSuperAdmin()
                    ? Area::dropdownValues()
                    : Area::where('id', $authUser->area_id)->get(['id', 'name'])
                        ->map(fn ($i) => ['value' => (string) $i->id, 'label' => $i->name])
                        ->toArray(),
                // Solo usuarios del mismo área (o todos si superadmin)
                'users' => User::userDropdownValues($authUser->isSuperAdmin() ? null : $authUser->area_id),
            ],
        ]);
    }

    /**
     * Muestra el formulario de edición de un proyecto existente.
     *
     * Aplica las mismas restricciones de área que en `create()`.
     *
     * @return Response
     */
    public function edit(Project $project)
    {
        /** @var User $authUser */
        $authUser = auth()->user();

        $project->load('users:id,name,avatar');

        return Inertia::render('Projects/Edit', [
            'item' => $project,
            'dropdowns' => [
                'areas' => $authUser->isSuperAdmin()
                    ? Area::dropdownValues()
                    : Area::where('id', $authUser->area_id)->get(['id', 'name'])
                        ->map(fn ($i) => ['value' => (string) $i->id, 'label' => $i->name])
                        ->toArray(),
                'users' => User::userDropdownValues($authUser->isSuperAdmin() ? null : $authUser->area_id),
            ],
        ]);
    }

    /**
     * Crea un nuevo proyecto con sus grupos de tareas por defecto.
     *
     * Los grupos iniciales representan el flujo estándar de trabajo:
     * Backlog → Por hacer → En curso → En revisión → Finalizado.
     *
     * @return RedirectResponse
     */
    public function store(StoreProjectRequest $request)
    {
        $data = $request->validated();

        $project = Project::create($data);

        // Asignar los usuarios seleccionados al proyecto
        $project->users()->attach($data['users']);

        // Crear los estados de tareas por defecto para el proyecto
        $project->taskGroups()->createMany([
            ['name' => 'Backlog'],
            ['name' => 'Por hacer'],
            ['name' => 'En curso'],
            ['name' => 'En revisión'],
            ['name' => 'Finalizado'],
        ]);

        return redirect()->route('projects.index')->success('Proyecto Creado', 'Un nuevo proyecto se creó con éxito.');
    }

    /**
     * Actualiza los datos de un proyecto y sincroniza sus usuarios asignados.
     *
     * @return RedirectResponse
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        $data = $request->validated();

        $project->update($data);

        // sync() agrega los nuevos usuarios y elimina los que ya no están en la lista
        $project->users()->sync($data['users']);

        return redirect()->route('projects.index')->success('Proyecto Actualizado', 'El proyecto se actualizó con éxito.');
    }

    /**
     * Archiva un proyecto (soft delete con registro del usuario que archivó).
     *
     * @return RedirectResponse
     */
    public function destroy(Project $project)
    {
        $project->update(['archived_by_id' => auth()->id()]);
        $project->archive();

        return redirect()->back()->success('Proyecto Archivado', 'El proyecto se archivó con éxito.');
    }

    /**
     * Restaura un proyecto archivado.
     *
     * @param  int  $projectId  ID del proyecto (se busca incluido en archivados).
     * @return RedirectResponse
     */
    public function restore(int $projectId)
    {
        $project = Project::withArchived()->findOrFail($projectId);

        $this->authorize('restore', $project);

        $project->unArchive();
        $project->update(['archived_by_id' => null]);

        return redirect()->back()->success('Proyecto Restaurado', 'La restauración del proyecto se realizó con éxito.');
    }

    /**
     * Elimina permanentemente un lote de proyectos archivados.
     *
     * @param  Request  $request  Contiene: ids (array de IDs a eliminar).
     * @return RedirectResponse
     */
    public function bulkForceDelete(Request $request, ForceDeleteService $forceDeleteService)
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:projects,id'],
        ]);

        $projects = Project::onlyArchived()->whereIn('id', $request->ids)->get();

        foreach ($projects as $project) {
            $this->authorize('forceDelete', $project);
        }

        $deletedCount = $forceDeleteService->forceDeleteProjects($projects);

        return redirect()->back()->success(
            'Proyecto Eliminado',
            "{$deletedCount} proyecto(s) fueron eliminados permanentemente."
        );
    }

    /**
     * Agrega o quita el proyecto de los favoritos del usuario autenticado.
     *
     * @return RedirectResponse
     */
    public function favoriteToggle(Project $project)
    {
        $this->authorize('view', $project);

        auth()->user()->toggleFavorite($project);

        return redirect()->back();
    }

    /**
     * Actualiza los usuarios con acceso al proyecto.
     *
     * Delega la lógica de sincronización al servicio ProjectService.
     *
     * @param  Request  $request  Contiene: users (array de IDs de usuarios con acceso).
     * @return RedirectResponse
     */
    public function userAccess(Request $request, Project $project)
    {
        $this->authorize('editUserAccess', $project);

        (new ProjectService($project))->updateUserAccess($request->get('users', []));

        return redirect()->back();
    }
}
