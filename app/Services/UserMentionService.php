<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

// Detecta y extrae usuarios mencionados (@usuario) en contenido HTML
class UserMentionService
{
    public static function hasMentions(?string $content): bool
    {
        return empty($content)
            ? false
            : Str::of($content)->contains('data-type="mention"');
    }

    // Extrae usuarios mencionados que tienen acceso al proyecto
    public static function getUsersFromMentions(string $content, Project $project): Collection
    {
        $users = PermissionService::usersWithAccessToProject($project);

        $foundUsers = $users->filter(function ($user) use ($content) {
            return Str::of($content)->contains("@{$user['name']}");
        });

        return User::findMany($foundUsers->pluck('id'));
    }
}
