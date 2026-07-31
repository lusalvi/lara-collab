<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

class RolePolicy
{
    // Roles que nadie puede modificar salvo el propio superadmin
    private array $protectedRoles = ['superadmin', 'admin'];

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view roles');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create role');
    }

    public function update(User $user, Role $role): bool
    {
        if (! $user->hasPermissionTo('edit role')) {
            return false;
        }

        if (in_array($role->name, $this->protectedRoles)) {
            return $user->isSuperAdmin();
        }

        return true;
    }

    public function delete(User $user, Role $role): bool
    {
        if (! $user->hasPermissionTo('archive role')) {
            return false;
        }

        if (in_array($role->name, $this->protectedRoles)) {
            return $user->isSuperAdmin();
        }

        return true;
    }

    public function restore(User $user, Role $role): bool
    {
        if (! $user->hasPermissionTo('restore role')) {
            return false;
        }

        if (in_array($role->name, $this->protectedRoles)) {
            return $user->isSuperAdmin();
        }

        return true;
    }
}
