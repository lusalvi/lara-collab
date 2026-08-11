<?php

namespace App\Models;

use App\Models\Concerns\HasArchivedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Lacodix\LaravelModelFilter\Traits\IsSearchable;
use Lacodix\LaravelModelFilter\Traits\IsSortable;
use LaravelArchivable\Archivable;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * Area
 * 
 * Área de negocio: agrupa usuarios, proyectos y administradores.
 * Traits: archivable, auditable, searchable, sortable
 */
class Area extends Model implements AuditableContract
{
    use Archivable, Auditable, HasArchivedBy, HasFactory, IsSearchable, IsSortable;

    protected $fillable = [
        'name',
        'archived_by_id',
    ];

    protected $searchable = [
        'name',
    ];

    protected $sortable = [
        'name' => 'asc',
    ];

    // ─── Relaciones ───────────────────────────────────────────────────────────
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Lista de áreas para dropdowns con opciones de filtro
     * 
     * @param array $options Opciones: ['hasProjects'] filtra solo áreas con proyectos
     * @return array Array [['value' => '1', 'label' => 'Área A'], ...]
     */
    public static function dropdownValues($options = []): array
    {
        return self::orderBy('name')
            ->when(in_array('hasProjects', $options), fn ($query) => $query->has('projects'))
            ->get(['id', 'name'])
            ->map(fn ($i) => ['value' => (string) $i->id, 'label' => $i->name])
            ->toArray();
    }
}
