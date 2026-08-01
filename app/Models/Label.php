<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Lacodix\LaravelModelFilter\Traits\IsSearchable;
use Lacodix\LaravelModelFilter\Traits\IsSortable;
use LaravelArchivable\Archivable;
use App\Models\Concerns\HasArchivedBy;

class Label extends Model
{
    use Archivable, HasArchivedBy, IsSearchable, IsSortable;

    protected $fillable = ['name', 'color', 'archived_by_id'];

    protected $searchable = [
        'name',
    ];

    protected $sortable = [
        'name' => 'asc',
    ];
}
