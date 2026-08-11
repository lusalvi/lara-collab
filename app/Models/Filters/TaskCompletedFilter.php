<?php

namespace App\Models\Filters;

use Illuminate\Database\Eloquent\Builder;
use Lacodix\LaravelModelFilter\Filters\Filter;

/**
 * TaskCompletedFilter
 *
 * Filtro utilizado para obtener tareas según su estado
 * de finalización.
 */
class TaskCompletedFilter extends Filter
{
    public function __construct(protected string $field) {}

    public function apply(Builder $query): Builder
    {
        // Una tarea se considera completada cuando tiene registrada
        // una fecha en el campo completed_at.
        return match ($this->values[0]) {
            'completed' => $query->whereNotNull('completed_at'),
        };
    }
}
