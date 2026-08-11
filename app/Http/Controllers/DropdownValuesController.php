<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * Controlador invocable para obtener valores de dropdowns dinámicos.
 *
 * Acepta parámetros por query string que indican qué listas devolver.
 * Esto permite que el frontend solicite solo los datos que necesita
 * en una única llamada.
 *
 * Parámetros soportados:
 * - `users`: lista de usuarios para selects (filtrada por área si no es superadmin).
 * - `mentionProjectUsers`: nombres de usuarios con acceso al proyecto (para menciones @).
 */
class DropdownValuesController extends Controller
{
    /**
     * Devuelve los valores de dropdown solicitados en formato JSON.
     *
     * @param  Request  $request  Puede contener: users, mentionProjectUsers (+ projectId).
     */
    public function __invoke(Request $request): JsonResponse
    {
        /** @var User $authUser */
        $authUser = $request->user();
        $dropdowns = collect();

        $dropdowns->when($request->has('users'), function (Collection $collection) use ($authUser) {
            // Superadmin ve todos los usuarios; admin de área solo ve los de su área
            $areaId = $authUser->isSuperAdmin() ? null : $authUser->area_id;

            return $collection->put('users', User::userDropdownValues($areaId));
        });

        $dropdowns->when($request->has('mentionProjectUsers'), function (Collection $collection) use ($request) {
            // Solo los usuarios con acceso al proyecto (para el autocompletado de menciones)
            $project = Project::findOrFail($request->projectId);
            $users = PermissionService::usersWithAccessToProject($project);

            return $collection->put('mentionProjectUsers', $users->pluck('name'));
        });

        return response()->json($dropdowns);
    }
}
