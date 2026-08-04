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

class AreaController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Area::class, 'area');
    }

    public function index(Request $request): Response
    {
        /** @var User $authUser */
        $authUser = $request->user();

        return Inertia::render('Areas/Index', [
            'items' => AreaResource::collection(
                Area::searchByQueryString()
                    ->sortByQueryString()
                    // Admin de área solo ve su propio área; superadmin ve todas
                    ->when(! $authUser->isSuperAdmin() && $authUser->area_id, fn ($q) => $q->where('id', $authUser->area_id))
                    ->when($request->has('archived'), fn ($query) => $query->onlyArchived())
                    ->paginate(12)
            ),
        ]);
    }

    public function create()
    {
        return Inertia::render('Areas/Create');
    }

    public function store(StoreAreaRequest $request)
    {
        (new CreateArea)->create($request->validated());

        return redirect()->route('areas.index')->success('Area created', 'A new area was successfully created.');
    }

    public function edit(Area $area)
    {
        return Inertia::render('Areas/Edit', [
            'item' => new AreaResource($area),
        ]);
    }

    public function update(Area $area, UpdateAreaRequest $request)
    {
        (new UpdateArea)->update($area, $request->validated());

        return redirect()->route('areas.index')->success('Area updated', 'The area was successfully updated.');
    }

    public function destroy(Area $area)
    {
        $area->update(['archived_by_id' => auth()->id()]);
        $area->archive();

        return redirect()->back()->success('Area archived', 'The area was successfully archived.');
    }

    public function restore(int $areaId)
    {
        $area = Area::withArchived()->findOrFail($areaId);

        $this->authorize('restore', $area);

        $area->unArchive();
        $area->update(['archived_by_id' => null]);

        return redirect()->back()->success('Area restored', 'The restoring of the area was completed successfully.');
    }

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

        $blockedAreas = $areas->filter(
            fn (Area $area) => $area->projects()->withArchived()->exists() || $area->users()->withArchived()->exists()
        );

        if ($blockedAreas->isNotEmpty()) {
            $names = $blockedAreas->pluck('name')->implode(', ');

            return redirect()->back()->warning(
                'Action stopped',
                "The following areas still have projects or users and cannot be permanently deleted: {$names}."
            );
        }

        $deletedCount = $forceDeleteService->forceDeleteAreas($areas);

        return redirect()->back()->success(
            'Areas deleted',
            "{$deletedCount} area(s) were permanently deleted."
        );
    }
}
