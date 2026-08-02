<?php

namespace App\Models\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
