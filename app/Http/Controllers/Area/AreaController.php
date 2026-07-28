<?php

namespace App\Http\Controllers\Area;

use App\Actions\Area\CreateArea;
use App\Actions\Area\UpdateArea;
use App\Http\Controllers\Controller;
use App\Http\Requests\Area\StoreAreaRequest;
use App\Http\Requests\Area\UpdateAreaRequest;
use App\Http\Resources\Area\AreaResource;
use App\Models\Area;
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
        return Inertia::render('Areas/Index', [
            'items' => AreaResource::collection(
                Area::searchByQueryString()
                    ->sortByQueryString()
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
        $area->archive();

        return redirect()->back()->success('Area archived', 'The area was successfully archived.');
    }

    public function restore(int $areaId)
    {
        $area = Area::withArchived()->findOrFail($areaId);

        $this->authorize('restore', $area);

        $area->unArchive();

        return redirect()->back()->success('Area restored', 'The restoring of the area was completed successfully.');
    }
}
