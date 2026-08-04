<?php

namespace App\Policies;

use App\Models\Label;
use App\Models\User;

class LabelPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view labels');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create label');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Label $label): bool
    {
        return $user->hasPermissionTo('edit label');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Label $label): bool
    {
        return $user->hasPermissionTo('archive label');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Label $label): bool
    {
        if (! $user->hasPermissionTo('restore label')) {
            return false;
        }

        return ! ($label->wasArchivedBySuperAdmin() && ! $user->isSuperAdmin());
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Label $label): bool
    {
        if (! $user->hasPermissionTo('force delete label')) {
            return false;
        }

        return ! ($label->wasArchivedBySuperAdmin() && ! $user->isSuperAdmin());
    }
}
