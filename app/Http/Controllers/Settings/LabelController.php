<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Label\StoreLabelRequest;
use App\Http\Requests\Label\UpdateLabelRequest;
use App\Http\Resources\Label\LabelResource;
use App\Models\Label;
use App\Services\ForceDeleteService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador de etiquetas (Settings).
 *
 * Las etiquetas son globales y se usan para clasificar tareas entre proyectos.
 */
class LabelController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Label::class, 'label');
    }

    /**
     * Lista las etiquetas con soporte de búsqueda, ordenamiento y archivadas.
     *
     * @param  Request  $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Settings/Labels/Index', [
            'items' => LabelResource::collection(
                Label::searchByQueryString()
                    ->sortByQueryString()
                    ->when($request->has('archived'), fn ($query) => $query->onlyArchived())
                    ->paginate(12)
            ),
        ]);
    }

    public function create()
    {
        return Inertia::render('Settings/Labels/Create');
    }

    /**
     * Crea una nueva etiqueta.
     *
     * @param  StoreLabelRequest  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(StoreLabelRequest $request)
    {
        Label::create($request->validated());

        return redirect()->route('settings.labels.index')->success('Etiqueta Creada', 'Una nueva etiqueta se creó con éxito.');
    }

    /**
     * Muestra el formulario de edición de una etiqueta.
     *
     * @param  Label  $label
     * @return \Inertia\Response
     */
    public function edit(Label $label)
    {
        return Inertia::render('Settings/Labels/Edit', ['item' => new LabelResource($label)]);
    }

    /**
     * Actualiza una etiqueta existente.
     *
     * @param  Label              $label
     * @param  UpdateLabelRequest $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Label $label, UpdateLabelRequest $request)
    {
        $label->update($request->validated());

        return redirect()->route('settings.labels.index')->success('Etiqueta Actualizada', 'La etiqueta se actualizó con éxito.');
    }

    /**
     * Archiva una etiqueta.
     *
     * @param  Label  $label
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Label $label)
    {
        $label->update(['archived_by_id' => auth()->id()]);
        $label->archive();

        return redirect()->back()->success('Etiqueta Archivada', 'La etiqueta se archivó con éxito.');
    }

    /**
     * Restaura una etiqueta archivada.
     *
     * @param  int  $labelId
     * @return \Illuminate\Http\RedirectResponse
     */
    public function restore(int $labelId)
    {
        $label = Label::withArchived()->findOrFail($labelId);

        $this->authorize('restore', $label);

        $label->unArchive();
        $label->update(['archived_by_id' => null]);

        return redirect()->back()->success('Etiqueta Restaurada', 'La restauración de la etiqueta se realizó con éxito.');
    }

    /**
     * Elimina permanentemente un lote de etiquetas archivadas.
     *
     * @param  Request             $request
     * @param  ForceDeleteService  $forceDeleteService
     * @return \Illuminate\Http\RedirectResponse
     */
    public function bulkForceDelete(Request $request, ForceDeleteService $forceDeleteService)
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:labels,id'],
        ]);

        $labels = Label::onlyArchived()->whereIn('id', $request->ids)->get();

        foreach ($labels as $label) {
            $this->authorize('forceDelete', $label);
        }

        $deletedCount = $forceDeleteService->forceDeleteLabels($labels);

        return redirect()->back()->success(
            'Etiquetas Eliminadas',
            "{$deletedCount} etiqueta(s) fueron eliminadas permanentemente."
        );
    }
}
