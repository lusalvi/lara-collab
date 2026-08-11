<?php

namespace App\Models;

use App\Models\Filters\WhereInFilter;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Lacodix\LaravelModelFilter\Traits\HasFilters;

class Activity extends Model
{
    use HasFilters;

    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'project_id',
        'title',
        'subtitle',
        'created_at',
    ];

    /**
     * Define los filtros disponibles para las actividades.
     *
     * Permite filtrar las actividades por proyecto utilizando
     * el parámetro de consulta "project".
     *
     * @return array Lista de filtros aplicables al modelo.
     */    
    public function filters(): array
    {
        return [
            (new WhereInFilter('project_id'))->setQueryName('project'),
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     *
     * Permite asociar una actividad con diferentes tipos de modelos,
     * como tareas, grupos u otras entidades registrables.
     *
     * @return MorphTo Relación polimórfica con el modelo de origen.
     */
    public function activityCapable(): MorphTo
    {
        return $this->morphTo();
    }
}
