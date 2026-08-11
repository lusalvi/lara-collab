<?php

namespace App\Models;

use App\Models\Concerns\HasArchivedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use LaravelArchivable\Archivable;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Spatie\EloquentSortable\Sortable;
use Spatie\EloquentSortable\SortableTrait;

class TaskGroup extends Model implements AuditableContract, Sortable
{
    use Archivable, Auditable, HasArchivedBy, HasFactory, SortableTrait;

    public $timestamps = false;

    protected $fillable = ['name', 'color', 'project_id', 'order_column', 'archived_by_id'];

    /**
     * Configura el comportamiento inicial del modelo.
     *
     * Aplica un scope global para que los grupos de tareas
     * se obtengan siempre respetando su orden establecido.
     */
    protected static function booted(): void
    {
        // Ordena automáticamente los grupos cada vez que se consultan.
        static::addGlobalScope('ordered', function ($query) {
            $query->ordered();
        });
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'group_id');
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'activity_capable');
    }
}
