<?php

namespace App\Models;

use App\Models\Concerns\HasArchivedBy;
use App\Models\Filters\IsNullFilter;
use App\Models\Filters\TaskCompletedFilter;
use App\Models\Filters\TaskOverdueFilter;
use App\Models\Filters\WhereHasFilter;
use App\Models\Filters\WhereInFilter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Lacodix\LaravelModelFilter\Traits\HasFilters;
use Lacodix\LaravelModelFilter\Traits\IsSearchable;
use LaravelArchivable\Archivable;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Spatie\EloquentSortable\Sortable;
use Spatie\EloquentSortable\SortableTrait;

class Task extends Model implements AuditableContract, Sortable
{
    use Archivable, Auditable, HasArchivedBy, HasFactory, HasFilters, IsSearchable, SortableTrait;

    private ?Project $fullProjectForPolicy = null;

    // Qué issue_type puede tener un hijo directo, según el issue_type del padre.
    public const ALLOWED_CHILD_TYPES = [
        'Epica' => ['Historia', 'Tarea'],
        'Historia' => ['Subtarea'],
        'Tarea' => ['Subtarea'],
        'Subtarea' => [],
    ];

    public function canHaveChildOfType(string $issueType): bool
    {
        return in_array($issueType, self::ALLOWED_CHILD_TYPES[$this->issue_type] ?? [], true);
    }

    protected $fillable = [
        'project_id',
        'group_id',
        'created_by_user_id',
        'assigned_to_user_id',
        'name',
        'number',
        'description',

        'issue_type',
        'parent_task_id',

        'start_on',
        'due_on',
        'priority_id',
        'order_column',

        'assigned_at',
        'completed_at',

        'due_soon_notified_at',
        'overdue_notified_at',

        'archived_by_id',
    ];

    protected $searchable = [
        'name',
        'number',
    ];

    protected $casts = [
        'start_on' => 'date',
        'due_on' => 'date',
        'completed_at' => 'datetime',
        'due_soon_notified_at' => 'datetime',
        'overdue_notified_at' => 'datetime',
        'priority' => 'integer',
    ];

    protected $observables = [
        'archived',
        'unArchived',
    ];

    protected $appends = [
        'can_force_delete',
        'can_restore',
    ];

    public array $defaultWith = [
        'project:id,name',
        'createdByUser:id,name,avatar',
        'assignedToUser:id,name,avatar',
        'subscribedUsers:id',
        'labels:id,name,color',
        'priority:id,label,color,order',
        'attachments',
        'parent:id,name,number,issue_type',
        'children:id,name,number,issue_type,parent_task_id',
    ];

    public function filters(): array
    {
        return [
            (new WhereInFilter('group_id'))->setQueryName('groups'),
            (new WhereInFilter('assigned_to_user_id'))->setQueryName('assignees'),
            (new TaskOverdueFilter('due_on'))->setQueryName('overdue'),
            (new IsNullFilter('due_on'))->setQueryName('not_set'),
            (new TaskCompletedFilter('completed_at'))->setQueryName('status'),
            (new WhereHasFilter('labels'))->setQueryName('labels'),
        ];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('ordered', function ($query) {
            $query->ordered();
        });
    }

    public function scopeWithDefault(Builder $query)
    {
        $query->with($this->defaultWith);
    }

    /* Tareas por vencer */
    public function scopeDueSoonPendingNotification(Builder $query): Builder
    {
        return $query
            ->whereDate('due_on', now()->addDay()->toDateString())
            ->whereNull('completed_at')
            ->whereNull('due_soon_notified_at')
            ->whereNotNull('assigned_to_user_id')
            ->whereHas('project');
    }

    /* Tareas vencidas */
    public function scopeOverduePendingNotification(Builder $query): Builder
    {
        return $query
            ->whereDate('due_on', '<', now()->toDateString())
            ->whereNull('completed_at')
            ->whereNull('overdue_notified_at')
            ->whereNotNull('assigned_to_user_id')
            ->whereHas('project');
    }

    public function loadDefault()
    {
        return $this->load($this->defaultWith);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function taskGroup(): BelongsTo
    {
        return $this->belongsTo(TaskGroup::class, 'group_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'parent_task_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Task::class, 'parent_task_id');
    }

    public function archiveWithChildren(?int $archivedById = null): void
    {
        foreach ($this->children()->withArchived()->get() as $child) {
            $child->archiveWithChildren($archivedById);
        }

        if ($archivedById) {
            $this->archived_by_id = $archivedById;
            $this->save();
        }

        $this->archive();
    }

    public function restoreWithChildren(): void
    {
        $this->unArchive();
        $this->update(['archived_by_id' => null]);

        foreach ($this->children()->withArchived()->get() as $child) {
            $child->restoreWithChildren();
        }
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function assignedToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function priority(): BelongsTo
    {
        return $this->belongsTo(TaskPriority::class, 'priority_id');
    }

    public function subscribedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'subscribe_task');
    }

    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(Label::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'activity_capable');
    }

    public function getCanForceDeleteAttribute(): ?bool
    {
        if (! $this->archived_at) {
            return null;
        }

        $user = auth()->user();

        if (! $user) {
            return null;
        }

        return $user->can('forceDelete', [$this, $this->projectForPolicy()]);
    }

    public function getCanRestoreAttribute(): ?bool
    {
        if (! $this->archived_at) {
            return null;
        }

        $user = auth()->user();

        if (! $user) {
            return null;
        }

        return $user->can('restore', [$this, $this->projectForPolicy()]);
    }

    /**
     * Resuelve el Project completo (no el select recortado de defaultWith) para
     * evaluar las policies de Task, que necesitan campos como area_id.
     */
    private function projectForPolicy(): ?Project
    {
        if ($this->relationLoaded('project') && $this->project && array_key_exists('area_id', $this->project->getAttributes())) {
            return $this->project;
        }

        return $this->fullProjectForPolicy ??= Project::withArchived()->find($this->project_id);
    }
}
