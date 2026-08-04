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
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Project::class, 'project');
    }

    public function index(Request $request)
    {
        /** @var User $authUser */
        $authUser = $request->user();

        return Inertia::render('Projects/Index', [
            'items' => ProjectResource::collection(
                Project::searchByQueryString()
                    // Superadmin ve todos; admin de área ve los de su área; resto solo los asignados
                    ->when($authUser->isSuperAdmin(), fn ($q) => $q) // sin filtro
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

    public function create()
    {
        /** @var User $authUser */
        $authUser = auth()->user();

        return Inertia::render('Projects/Create', [
            'dropdowns' => [
                // Superadmin ve todas las áreas; admin solo ve la suya
                'areas' => $authUser->isSuperAdmin()
                    ? Area::dropdownValues()
                    : Area::where('id', $authUser->area_id)->get(['id', 'name'])
                        ->map(fn ($i) => ['value' => (string) $i->id, 'label' => $i->name])
                        ->toArray(),
                // Solo usuarios del mismo área
                'users' => User::userDropdownValues($authUser->isSuperAdmin() ? null : $authUser->area_id),
            ],
        ]);
    }

    public function edit(Project $project)
    {
        /** @var User $authUser */
        $authUser = auth()->user();

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

    public function store(StoreProjectRequest $request)
    {
        $data = $request->validated();

        $project = Project::create($data);

        $project->users()->attach($data['users']);

        $project->taskGroups()->createMany([
            ['name' => 'Backlog'],
            ['name' => 'Por hacer'],
            ['name' => 'En curso'],
            ['name' => 'En revisión'],
            ['name' => 'Finalizado'],
        ]);

        return redirect()->route('projects.index')->success('Project created', 'A new project was successfully created.');
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        $data = $request->validated();

        $project->update($data);

        $project->users()->sync($data['users']);

        return redirect()->route('projects.index')->success('Project updated', 'The project was successfully updated.');
    }

    public function destroy(Project $project)
    {
        $project->update(['archived_by_id' => auth()->id()]);
        $project->archive();

        return redirect()->back()->success('Project archived', 'The project was successfully archived.');
    }

    public function restore(int $projectId)
    {
        $project = Project::withArchived()->findOrFail($projectId);

        $this->authorize('restore', $project);

        $project->unArchive();
        $project->update(['archived_by_id' => null]);

        return redirect()->back()->success('Project restored', 'The restoring of the project was completed successfully.');
    }

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
            'Projects deleted',
            "{$deletedCount} project(s) were permanently deleted."
        );
    }

    public function favoriteToggle(Project $project)
    {
        $this->authorize('view', $project);

        auth()->user()->toggleFavorite($project);

        return redirect()->back();
    }

    public function userAccess(Request $request, Project $project)
    {
        $this->authorize('editUserAccess', $project);

        (new ProjectService($project))->updateUserAccess($request->get('users', []));

        return redirect()->back();
    }
}
