<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Collection;

class PermissionService
{
    public static $permissionsByRole = [
        'admin' => [
            'User' => ['view users', 'create user', 'edit user', 'archive user', 'restore user'],
            'Label' => ['view labels', 'create label', 'edit label', 'archive label', 'restore label'],
            'Task Priority' => ['view task priority', 'create task priority', 'edit task priority', 'delete task priority', 'restore task priority'],
            'Role' => ['view roles', 'create role', 'edit role', 'archive role', 'restore role'],
            'Area' => ['view areas', 'create area', 'edit area', 'archive area', 'restore area'],
            'Project' => ['view projects', 'view project', 'create project', 'edit project', 'archive project', 'restore project', 'edit project user access'],
            'TaskGroups' => ['create task group', 'edit task group', 'archive task group', 'restore task group', 'reorder task group'],
            'Notes' => ['view notes', 'create note', 'edit note', 'delete note'],
            'Tasks' => [
                'view tasks', 'create task', 'edit task', 'archive task', 'restore task', 'reorder task', 'complete task', 'view comments',
            ],
            'Activities' => ['view activities'],
        ],
        'manager' => [
            'User' => ['view users'],
            'Project' => ['view projects', 'view project', 'create project', 'edit project', 'archive project', 'restore project', 'edit project user access'],
            'TaskGroups' => ['create task group', 'edit task group', 'archive task group', 'restore task group', 'reorder task group'],
            'Notes' => ['view notes', 'create note', 'edit note', 'delete note'],
            'Tasks' => [
                'view tasks', 'create task', 'edit task', 'archive task', 'restore task', 'reorder task', 'complete task', 'view comments',
            ],
        ],
        'developer' => [
            'Project' => ['view projects', 'view project'],
            'Notes' => ['view notes', 'create note', 'edit note'],
            'Tasks' => [
                'view tasks', 'create task', 'edit task', 'restore task', 'reorder task', 'complete task', 'view comments',
            ],
        ],
        'qa engineer' => [
            'Project' => ['view projects', 'view project'],
            'Notes' => ['view notes', 'create note', 'edit note'],
            'Tasks' => [
                'view tasks', 'create task', 'edit task', 'view comments',
            ],
        ],
        'designer' => [
            'Project' => ['view projects', 'view project'],
            'Notes' => ['view notes', 'create note', 'edit note'],
            'Tasks' => [
                'view tasks', 'create task', 'edit task', 'restore task', 'reorder task', 'complete task', 'view comments',
            ],
        ],
    ];

    public static function allPermissionsGrouped(): array
    {
        return self::$permissionsByRole['admin'];
    }

    private static $usersWithAccessToProject = [];

    public static function usersWithAccessToProject($project): Collection
    {
        if (isset(self::$usersWithAccessToProject[$project->id])) {
            return self::$usersWithAccessToProject[$project->id];
        }

        $admins = User::role('admin')
            ->with('roles:id,name')
            ->get(['id', 'name', 'avatar'])
            ->map(fn ($user) => [...$user->toArray(), 'reason' => 'admin']);

        $givenAccess = $project
            ->users
            ->load('roles:id,name')
            ->map(fn ($user) => [...$user->toArray(), 'reason' => 'given access']);

        return self::$usersWithAccessToProject[$project->id] = collect([
            ...$admins,
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
        if ($user->hasRole('admin')) {
            return Project::all();
        }

        return self::$projectsThatUserCanAccess = collect($user->projects->toArray())
            ->unique('id')
            ->sortBy('name')
            ->values();
    }
}
