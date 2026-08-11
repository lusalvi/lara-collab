<?php

namespace App\Models;

use App\Models\Concerns\HasArchivedBy;
use Illuminate\Database\Eloquent\Model;
use Lacodix\LaravelModelFilter\Traits\IsSearchable;
use Lacodix\LaravelModelFilter\Traits\IsSortable;
use LaravelArchivable\Archivable;

/**
 * Label
 *
 * Etiquetas utilizadas para clasificar y organizar elementos del sistema.
 * Incluye funcionalidades de archivado, búsqueda y ordenamiento.
 */
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
