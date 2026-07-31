<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view users');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create user');
    }

    /**
     * Solo puede editar usuarios de su misma área (o el superadmin).
     */
    public function update(User $user, User $model): bool
    {
        if (! $user->hasPermissionTo('edit user')) {
            return false;
        }

        // El superadmin puede editar a cualquiera
        if ($user->isSuperAdmin()) {
            return true;
        }

        // El admin de área solo puede editar usuarios de su área
        return $user->area_id === $model->area_id;
    }

    /**
     * Solo puede archivar usuarios de su misma área (o el superadmin).
     */
    public function delete(User $user, User $model): bool
    {
        if (! $user->hasPermissionTo('archive user')) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->area_id === $model->area_id;
    }

    /**
     * Solo puede restaurar usuarios de su misma área (o el superadmin).
     */
    public function restore(User $user, User $model): bool
    {
        if (! $user->hasPermissionTo('restore user')) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->area_id === $model->area_id;
    }
}
