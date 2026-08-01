<?php

namespace App\Models;

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
    use Archivable, Auditable, HasFactory, HasFilters, IsSearchable, SortableTrait;

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
            ->whereNotNull('assigned_to_user_id');
    }

    /* Tareas vencidas */
    public function scopeOverduePendingNotification(Builder $query): Builder
    {
        return $query
            ->whereDate('due_on', '<', now()->toDateString())
            ->whereNull('completed_at')
            ->whereNull('overdue_notified_at')
            ->whereNotNull('assigned_to_user_id');
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

    public function archiveWithChildren(): void
    {
        foreach ($this->children()->withArchived()->get() as $child) {
            $child->archiveWithChildren();
        }

        $this->archive();
    }

    public function restoreWithChildren(): void
    {
        $this->unArchive();

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
}
