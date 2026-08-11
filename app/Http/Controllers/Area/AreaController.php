<?php

namespace App\Http\Controllers\Area;

use App\Actions\Area\CreateArea;
use App\Actions\Area\UpdateArea;
use App\Http\Controllers\Controller;
use App\Http\Requests\Area\StoreAreaRequest;
use App\Http\Requests\Area\UpdateAreaRequest;
use App\Http\Resources\Area\AreaResource;
use App\Models\Area;
use App\Models\User;
use App\Services\ForceDeleteService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador de áreas organizacionales.
 *
 * Gestiona el CRUD de áreas con control de acceso por rol:
 * el superadmin puede operar sobre todas las áreas, mientras que
 * el admin de área solo puede ver y gestionar la suya propia.
 */
class AreaController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Area::class, 'area');
    }

    /**
     * Muestra el listado de áreas paginado.
     *
     * El superadmin ve todas las áreas; el admin de área solo ve la propia.
     *
     * @param  Request  $request  Puede contener: search, sort, archived.
     * @return Response
     */
    public function index(Request $request): Response
    {
        /** @var User $authUser */
        $authUser = $request->user();

        return Inertia::render('Areas/Index', [
            'items' => AreaResource::collection(
                Area::searchByQueryString()
                    ->sortByQueryString()
                    // Admin de área solo ve su propio área; superadmin ve todas
                    ->when(! $authUser->isSuperAdmin() && $authUser->area_id, fn($q) => $q->where('id', $authUser->area_id))
                    ->when($request->has('archived'), fn($query) => $query->onlyArchived())
                    ->paginate(12)
            ),
        ]);
    }

    /**
     * Muestra el formulario de creación de área.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('Areas/Create');
    }

    /**
     * Crea una nueva área.
     *
     * @param  StoreAreaRequest  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(StoreAreaRequest $request)
    {
        (new CreateArea)->create($request->validated());

        return redirect()->route('areas.index')->success('Área Creada', 'Una nueva área se creó con éxito.');
    }

    /**
     * Muestra el formulario de edición de un área.
     *
     * @param  Area  $area
     * @return \Inertia\Response
     */
    public function edit(Area $area)
    {
        return Inertia::render('Areas/Edit', [
            'item' => new AreaResource($area),
        ]);
    }

    /**
     * Actualiza los datos de un área existente.
     *
     * @param  Area              $area
     * @param  UpdateAreaRequest $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Area $area, UpdateAreaRequest $request)
    {
        (new UpdateArea)->update($area, $request->validated());

        return redirect()->route('areas.index')->success('Área Actualizada', 'El área se actualizó con éxito.');
    }

    /**
     * Archiva un área (soft delete con registro del usuario que archivó).
     *
     * @param  Area  $area
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Area $area)
    {
        $area->update(['archived_by_id' => auth()->id()]);
        $area->archive();

        return redirect()->back()->success('Área Archivada', 'El área se archivó con éxito.');
    }

    /**
     * Restaura un área archivada.
     *
     * @param  int  $areaId  ID del área (se busca incluida en archivadas).
     * @return \Illuminate\Http\RedirectResponse
     */
    public function restore(int $areaId)
    {
        $area = Area::withArchived()->findOrFail($areaId);

        $this->authorize('restore', $area);

        $area->unArchive();
        $area->update(['archived_by_id' => null]);

        return redirect()->back()->success('Área Restaurada', 'La restauración del área se realizó con éxito.');
    }

    /**
     * Elimina permanentemente un lote de áreas archivadas.
     *
     * Bloquea la eliminación si alguna de las áreas todavía tiene usuarios
     * o proyectos asociados (incluso archivados), e informa cuáles son las afectadas.
     *
     * @param  Request             $request            Contiene: ids (array de IDs a eliminar).
     * @param  ForceDeleteService  $forceDeleteService
     * @return \Illuminate\Http\RedirectResponse
     */
    public function bulkForceDelete(Request $request, ForceDeleteService $forceDeleteService)
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:areas,id'],
        ]);

        $areas = Area::onlyArchived()->whereIn('id', $request->ids)->get();

        foreach ($areas as $area) {
            $this->authorize('forceDelete', $area);
        }

        // No se puede eliminar un área que aún tiene usuarios o proyectos vinculados
        $blockedAreas = $areas->filter(
            fn(Area $area) => $area->projects()->withArchived()->exists() || $area->users()->withArchived()->exists()
        );

        if ($blockedAreas->isNotEmpty()) {
            $names = $blockedAreas->pluck('name')->implode(', ');

            return redirect()->back()->warning(
                'Acción Detenida',
                "Las siguientes áreas aún tienen usuarios o proyectos. No pueden ser eliminadas permanentemente: {$names}."
            );
        }

        $deletedCount = $forceDeleteService->forceDeleteAreas($areas);

        return redirect()->back()->success(
            'Área Eliminada',
            "{$deletedCount} área(s) fueron eliminadas permanentemente."
        );
    }
}
