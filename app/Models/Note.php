<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Note
 *
 * Nota del proyecto: puede estar protegida con passcode encriptado (PBKDF2).
 * El passcode_salt nunca se expone en JSON.
 */
class Note extends Model
{
    protected $fillable = [
        'project_id',
        'title',
        'content',
        'is_locked',
        'passcode_salt',
    ];

    protected $casts = [
        'is_locked' => 'boolean',
    ];

    protected $hidden = [
        'passcode_salt',
    ];

    // ─── Relaciones ───────────────────────────────────────────────────────────
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
