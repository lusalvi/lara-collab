<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Collection;

class PermissionService
{
    public static $permissionsByRole = [

        // ─── SUPERADMIN: gestión global ───────────────────────────────────────
        'superadmin' => [
            'Area' => ['view areas', 'create area', 'edit area', 'archive area', 'restore area'],
            'User' => ['view users', 'create user', 'edit user', 'archive user', 'restore user'],
            'Role' => ['view roles', 'create role', 'edit role', 'archive role', 'restore role'],
            'Label' => ['view labels', 'create label', 'edit label', 'archive label', 'restore label'],
            'Task Priority' => ['view task priority', 'create task priority', 'edit task priority', 'delete task priority', 'restore task priority'],
            'Project' => ['view projects', 'view project', 'create project', 'edit project', 'archive project', 'restore project', 'edit project user access'],
            'TaskGroups' => ['create task group', 'edit task group', 'archive task group', 'restore task group', 'reorder task group'],
            'Notes' => ['view notes', 'create note', 'edit note', 'delete note'],
            'Tasks' => ['view tasks', 'create task', 'edit task', 'archive task', 'restore task', 'reorder task', 'complete task', 'view comments'],
            'Activities' => ['view activities'],
        ],

        // ─── ADMIN DE ÁREA: igual que antes pero SIN gestión de áreas ─────────
        'admin' => [
            'User' => ['view users', 'create user', 'edit user', 'archive user', 'restore user'],
            'Label' => ['view labels', 'create label', 'edit label', 'archive label', 'restore label'],
            'Task Priority' => ['view task priority', 'create task priority', 'edit task priority', 'delete task priority', 'restore task priority'],
            'Role' => ['view roles', 'create role', 'edit role', 'archive role', 'restore role'],
            'Project' => ['view projects', 'view project', 'create project', 'edit project', 'archive project', 'restore project', 'edit project user access'],
            'TaskGroups' => ['create task group', 'edit task group', 'archive task group', 'restore task group', 'reorder task group'],
            'Notes' => ['view notes', 'create note', 'edit note', 'delete note'],
            'Tasks' => ['view tasks', 'create task', 'edit task', 'archive task', 'restore task', 'reorder task', 'complete task', 'view comments'],
            'Activities' => ['view activities'],
        ],

        // ─── RESTO DE ROLES: sin cambios ─────────────────────────────────────
        'manager' => [
            'User' => ['view users'],
            'Project' => ['view projects', 'view project', 'create project', 'edit project', 'archive project', 'restore project', 'edit project user access'],
            'TaskGroups' => ['create task group', 'edit task group', 'archive task group', 'restore task group', 'reorder task group'],
            'Notes' => ['view notes', 'create note', 'edit note', 'delete note'],
            'Tasks' => ['view tasks', 'create task', 'edit task', 'archive task', 'restore task', 'reorder task', 'complete task', 'view comments'],
        ],
        'developer' => [
            'Project' => ['view projects', 'view project'],
            'Notes' => ['view notes', 'create note', 'edit note'],
            'Tasks' => ['view tasks', 'create task', 'edit task', 'restore task', 'reorder task', 'complete task', 'view comments'],
        ],
        'qa engineer' => [
            'Project' => ['view projects', 'view project'],
            'Notes' => ['view notes', 'create note', 'edit note'],
            'Tasks' => ['view tasks', 'create task', 'edit task', 'view comments'],
        ],
        'designer' => [
            'Project' => ['view projects', 'view project'],
            'Notes' => ['view notes', 'create note', 'edit note'],
            'Tasks' => ['view tasks', 'create task', 'edit task', 'restore task', 'reorder task', 'complete task', 'view comments'],
        ],
    ];

    public static function allPermissionsGrouped(): array
    {
        return self::$permissionsByRole['superadmin'];
    }

    // ─── Helpers de rol ───────────────────────────────────────────────────────

    public static function isSuperAdmin(User $user): bool
    {
        return $user->hasRole('superadmin');
    }

    public static function isAreaAdmin(User $user): bool
    {
        return $user->hasRole('admin');
    }

    // ─── Acceso a proyectos ───────────────────────────────────────────────────

    private static $usersWithAccessToProject = [];

    public static function usersWithAccessToProject(Project $project): Collection
    {
        if (isset(self::$usersWithAccessToProject[$project->id])) {
            return self::$usersWithAccessToProject[$project->id];
        }

        // Los admins del MISMO área tienen acceso automático al proyecto
        $areaAdmins = User::role('admin')
            ->where('area_id', $project->area_id)
            ->with('roles:id,name')
            ->get(['id', 'name', 'avatar'])
            ->map(fn ($u) => [...$u->toArray(), 'reason' => 'area admin']);

        // El superadmin siempre tiene acceso
        $superAdmins = User::role('superadmin')
            ->with('roles:id,name')
            ->get(['id', 'name', 'avatar'])
            ->map(fn ($u) => [...$u->toArray(), 'reason' => 'superadmin']);

        // Acceso explícito dado al proyecto
        $givenAccess = $project
            ->users
            ->load('roles:id,name')
            ->map(fn ($u) => [...$u->toArray(), 'reason' => 'given access']);

        return self::$usersWithAccessToProject[$project->id] = collect([
            ...$superAdmins,
            ...$areaAdmins,
            ...$givenAccess,
        ])
            ->unique('id')
            ->sortBy('name')
            ->values();
    }

    private static $projectsThatUserCanAccess = null;

    public static function projectsThatUserCanAccess(User $user): Collection
    {
        if (self::$projectsThatUserCanAccess !== null) {
            return self::$projectsThatUserCanAccess;
        }

        // Superadmin ve todos los proyectos
        if (self::isSuperAdmin($user)) {
            return self::$projectsThatUserCanAccess = Project::all();
        }

        // Admin de área ve todos los proyectos de su área
        if (self::isAreaAdmin($user) && $user->area_id) {
            return self::$projectsThatUserCanAccess = Project::where('area_id', $user->area_id)->get();
        }

        return self::$projectsThatUserCanAccess = collect($user->projects->toArray())
            ->unique('id')
            ->sortBy('name')
            ->values();
    }
}
