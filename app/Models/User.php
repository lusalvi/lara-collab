<?php

namespace App\Models;

use App\Services\PermissionService;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Lacodix\LaravelModelFilter\Traits\IsSearchable;
use Lacodix\LaravelModelFilter\Traits\IsSortable;
use Laravel\Sanctum\HasApiTokens;
use LaravelArchivable\Archivable;
use Overtrue\LaravelFavorite\Traits\Favoriter;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements AuditableContract, CanResetPasswordContract
{
    use Archivable, Auditable, CanResetPassword, Favoriter, HasApiTokens, HasFactory, HasRoles, IsSearchable, IsSortable, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'job_title',
        'avatar',
        'phone',
        'google_id',
        'area_id',
    ];

    protected $searchable = [
        'name',
        'email',
        'job_title',
    ];

    protected $sortable = [
        'name' => 'asc',
        'email',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // ─── Relaciones ───────────────────────────────────────────────────────────

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_user_access');
    }

    public function subscribedToTasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'subscribe_task');
    }

    // ─── Helpers de rol ───────────────────────────────────────────────────────

    public function getFirstName(): string
    {
        return Str::beforeLast($this->name, ' ');
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('superadmin');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isNotAdmin(): bool
    {
        return ! $this->isAdmin() && ! $this->isSuperAdmin();
    }

    /**
     * Devuelve true si el usuario puede operar dentro del área dada.
     * El superadmin puede operar en cualquier área.
     */
    public function belongsToArea(?int $areaId): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->area_id === $areaId;
    }

    // ─── Acceso a proyectos ───────────────────────────────────────────────────

    public function hasProjectAccess(Project $project): bool
    {
        $users = PermissionService::usersWithAccessToProject($project);

        return $users->pluck('id')->contains($this->id);
    }

    // ─── Dropdown helpers ─────────────────────────────────────────────────────

    /**
     * Lista de usuarios para dropdowns.
     * El superadmin ve todos; los demás solo ven usuarios de su área.
     */
    public static function userDropdownValues(?int $areaId = null): array
    {
        return self::orderBy('name')
            ->when($areaId !== null, fn ($q) => $q->where('area_id', $areaId))
            ->get(['id', 'name'])
            ->map(fn ($i) => ['value' => (string) $i->id, 'label' => $i->name])
            ->toArray();
    }
}
