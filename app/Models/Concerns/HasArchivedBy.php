<?php

namespace App\Models\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * HasArchivedBy
 *
 * Trait que agrega al modelo la relación con el usuario
 * responsable de archivar el registro y permite verificar
 * si fue archivado por un superadministrador.
 */
trait HasArchivedBy
{
    public function archivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'archived_by_id');
    }

    public function wasArchivedBySuperAdmin(): bool
    {
        return (bool) $this->archivedBy?->isSuperAdmin();
    }
}
