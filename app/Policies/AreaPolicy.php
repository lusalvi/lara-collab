<?php

namespace App\Policies;

use App\Models\Area;
use App\Models\User;

class AreaPolicy
{
    /**
     * El superadmin puede ver todas las áreas.
     * El admin de área puede ver su propia área (para navegar).
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isAdmin();
    }

    /**
     * Solo el superadmin crea áreas.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Solo el superadmin edita áreas.
     */
    public function update(User $user, Area $area): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Solo el superadmin archiva áreas.
     */
    public function delete(User $user, Area $area): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Solo el superadmin restaura áreas.
     */
    public function restore(User $user, Area $area): bool
    {
        return $user->isSuperAdmin();
    }
}
