<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Attachment
 * 
 * Archivo adjunto de una tarea. Incluye path del archivo, thumbnail (si imagen),
 * tipo MIME, tamaño. ForceDeleteService borra archivos físicos del disco.
 */
class Attachment extends Model
{
    protected $fillable = [
        'task_id',
        'user_id',
        'name',
        'path',
        'thumb',
        'type',
        'size',
    ];

    // ─── Relaciones ───────────────────────────────────────────────────────────
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
