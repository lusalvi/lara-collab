<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class DropdownValuesController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        /** @var User $authUser */
        $authUser = $request->user();
        $dropdowns = collect();

        $dropdowns->when($request->has('users'), function (Collection $collection) use ($authUser) {
            $areaId = $authUser->isSuperAdmin() ? null : $authUser->area_id;

            return $collection->put('users', User::userDropdownValues($areaId));
        });

        $dropdowns->when($request->has('mentionProjectUsers'), function (Collection $collection) use ($request) {
            $project = Project::findOrFail($request->projectId);
            $users = PermissionService::usersWithAccessToProject($project);

            return $collection->put('mentionProjectUsers', $users->pluck('name'));
        });

        return response()->json($dropdowns);
    }
}
