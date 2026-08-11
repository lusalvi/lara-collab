<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * Comment
 * 
 * Comentario en una tarea. Genera actividad (historial) automáticamente vía observer.
 */
class Comment extends Model
{
    protected $fillable = [
        'user_id',
        'task_id',
        'content',
    ];

    // ─── Relaciones ───────────────────────────────────────────────────────────
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Actividades generadas por este comentario
     * 
     * @return MorphMany
     */
    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'activity_capable');
    }
}
