<?php

namespace App\Policies;

use App\Models\Area;
use App\Models\User;

class AreaPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view areas');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create area');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Area $model): bool
    {
        return $user->hasPermissionTo('edit area');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Area $model): bool
    {
        return $user->hasPermissionTo('archive area');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Area $model): bool
    {
        return $user->hasPermissionTo('restore area');
    }
}