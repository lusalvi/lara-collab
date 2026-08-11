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

/**
 * Task (Actividad/Tarea)
 * 
 * Jerarquía: Épica → Historia → Tarea → Subtarea
 * Características: archivable, auditable, ordenable, filtrable, searchable
 */
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

    /**
     * Verifica si esta tarea puede tener un hijo del tipo especificado
     * 
     * @param string $issueType Tipo de hijo (Subtarea, etc.)
     * @return bool
     */
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

     /**
     * Define filtros disponibles para esta tarea
     * 
     * @return array Filtros por group_id, assignee, due_on, status, labels, etc.
     */
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

    /**
     * Scope: Carga relaciones por defecto
     * 
     * @param Builder $query
     * @return void
     */
    public function scopeWithDefault(Builder $query)
    {
        $query->with($this->defaultWith);
    }

    /**
     * Scope: Tareas próximas a vencer sin notificar
     * 
     * Busca tareas con due_on = mañana, no completadas, no notificadas, con usuario asignado
     * 
     * @param Builder $query
     * @return Builder
     */    
    public function scopeDueSoonPendingNotification(Builder $query): Builder
    {
        return $query
            ->whereDate('due_on', now()->addDay()->toDateString())
            ->whereNull('completed_at')
            ->whereNull('due_soon_notified_at')
            ->whereNotNull('assigned_to_user_id')
            ->whereHas('project');
    }


    /**
     * Scope: Tareas vencidas sin notificar
     * 
     * Busca tareas con due_on < hoy, no completadas, no notificadas, con usuario asignado
     * 
     * @param Builder $query
     * @return Builder
     */
    public function scopeOverduePendingNotification(Builder $query): Builder
    {
        return $query
            ->whereDate('due_on', '<', now()->toDateString())
            ->whereNull('completed_at')
            ->whereNull('overdue_notified_at')
            ->whereNotNull('assigned_to_user_id')
            ->whereHas('project');
    }

    /**
     * Carga relaciones por defecto en esta instancia
     * 
     * @return Task
     */
    public function loadDefault()
    {
        return $this->load($this->defaultWith);
    }

    /**
     * Proyecto al que pertenece
     * 
     * @return BelongsTo
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Grupo de tareas (TaskGroup) al que pertenece
     * 
     * @return BelongsTo
     */
    public function taskGroup(): BelongsTo
    {
        return $this->belongsTo(TaskGroup::class, 'group_id');
    }
    /**
     * Tarea padre (si es subtarea)
     * 
     * @return BelongsTo
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'parent_task_id');
    }

    /**
     * Tareas hijas (subtareas)
     * 
     * @return HasMany
     */
    public function children(): HasMany
    {
        return $this->hasMany(Task::class, 'parent_task_id');
    }

    /**
     * Archiva esta tarea y sus hijas recursivamente
     * 
     * @param int|null $archivedById ID del usuario que archiva (para auditoría)
     * @return void
     */
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
    /**
     * Restaura esta tarea y sus hijas recursivamente
     * 
     * Limpia archived_by_id y desarchiva en cascada
     * 
     * @return void
     */
    public function restoreWithChildren(): void
    {
        $this->unArchive();
        $this->update(['archived_by_id' => null]);

        foreach ($this->children()->withArchived()->get() as $child) {
            $child->restoreWithChildren();
        }
    }
    /**
     * Usuario que creó la tarea
     * 
     * @return BelongsTo
     */
    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Usuario asignado a la tarea
     * 
     * @return BelongsTo
     */
    public function assignedToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    /**
     * Prioridad de la tarea
     * 
     * @return BelongsTo
     */    
    public function priority(): BelongsTo
    {
        return $this->belongsTo(TaskPriority::class, 'priority_id');
    }

    /**
     * Usuarios suscritos a esta tarea (reciben notificaciones)
     * 
     * @return BelongsToMany
     */
    public function subscribedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'subscribe_task');
    }

    /**
     * Labels/etiquetas de la tarea
     * 
     * @return BelongsToMany
     */
    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(Label::class);
    }
    /**
     * Archivos adjuntos de la tarea
     * 
     * @return HasMany
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }
    /**
     * Comentarios de la tarea
     * 
     * @return HasMany
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
    /**
     * Actividades/historial de cambios de la tarea
     * 
     * @return MorphMany
     */
    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'activity_capable');
    }

    /**
     * ¿Puede el usuario actual forzar borrado de esta tarea?
     * 
     * Retorna null si no está archivada o no hay usuario autenticado
     * 
     * @return bool|null
     */
    public function getCanForceDeleteAttribute(): ?bool
    {
        // Solo si está archivada
        if (! $this->archived_at) {
            return null;
        }

        $user = auth()->user();

        if (! $user) {
            return null;
        }
        // Valida policy pasando project completo (no el select de defaultWith)
        return $user->can('forceDelete', [$this, $this->projectForPolicy()]);
    }
    /**
     * ¿Puede el usuario actual restaurar esta tarea?
     * 
     * Retorna null si no está archivada o no hay usuario autenticado
     * 
     * @return bool|null
     */
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
     * Obtiene el Project completo para evaluar policies
     * 
     * Las policies necesitan area_id que no viene en defaultWith.
     * Si project ya está cargado y tiene area_id, lo usa; sino, lo query
     * 
     * @return Project|null
     */
    private function projectForPolicy(): ?Project
    {
        // Si project ya está cargado y tiene area_id, retorna
        if ($this->relationLoaded('project') && $this->project && array_key_exists('area_id', $this->project->getAttributes())) {
            return $this->project;
        }
        // Sino, query project completo y cachea en propiedad privada
        return $this->fullProjectForPolicy ??= Project::withArchived()->find($this->project_id);
    }
}
