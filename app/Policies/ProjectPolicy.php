<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view projects');
    }

    public function view(User $user, Project $project): bool
    {
        if (! $user->hasPermissionTo('view project')) {
            return false;
        }

        // Debe pertenecer al área del proyecto
        if (! $user->belongsToArea($project->area_id)) {
            return false;
        }

        return $user->hasProjectAccess($project);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create project');
    }

    public function update(User $user, Project $project): bool
    {
        if (! $user->hasPermissionTo('edit project')) {
            return false;
        }

        if (! $user->belongsToArea($project->area_id)) {
            return false;
        }

        return $user->hasProjectAccess($project);
    }

    public function delete(User $user, Project $project): bool
    {
        if (! $user->hasPermissionTo('archive project')) {
            return false;
        }

        if (! $user->belongsToArea($project->area_id)) {
            return false;
        }

        return $user->hasProjectAccess($project);
    }

    public function restore(User $user, Project $project): bool
    {
        if (! $user->hasPermissionTo('restore project')) {
            return false;
        }

        if ($project->wasArchivedBySuperAdmin() && ! $user->isSuperAdmin()) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        if (! $user->belongsToArea($project->area_id)) {
            return false;
        }

        return $user->hasProjectAccess($project);
    }

    public function forceDelete(User $user, Project $project): bool
    {
        if (! $user->hasPermissionTo('force delete project')) {
            return false;
        }

        if ($project->wasArchivedBySuperAdmin() && ! $user->isSuperAdmin()) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->belongsToArea($project->area_id);
    }

    public function editUserAccess(User $user, Project $project): bool
    {
        if (! $user->hasPermissionTo('edit project user access')) {
            return false;
        }

        if (! $user->belongsToArea($project->area_id)) {
            return false;
        }

        return $user->hasProjectAccess($project);
    }
}
