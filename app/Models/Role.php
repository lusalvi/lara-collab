<?php

namespace App\Models;

use Lacodix\LaravelModelFilter\Traits\IsSearchable;
use Lacodix\LaravelModelFilter\Traits\IsSortable;
use LaravelArchivable\Archivable;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    use Archivable, IsSearchable, IsSortable;

    protected $fillable = ['name', 'guard_name', 'archived_by_id'];

    protected $searchable = [
        'name',
    ];

    protected $sortable = [
        'name' => 'asc',
    ];

    public function archivedBy()
    {
        return $this->belongsTo(User::class, 'archived_by_id');
    }
}
