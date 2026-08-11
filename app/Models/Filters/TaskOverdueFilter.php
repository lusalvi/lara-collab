<?php

namespace App\Models\Filters;

use Illuminate\Database\Eloquent\Builder;
use Lacodix\LaravelModelFilter\Filters\Filter;

/**
 * TaskOverdueFilter
 *
 * Filtro utilizado para obtener tareas cuyo plazo ya venció
 * y que todavía no fueron completadas.
 */
class TaskOverdueFilter extends Filter
{
    public function __construct(protected string $field) {}

    public function apply(Builder $query): Builder
    {
        // La tarea debe tener una fecha anterior al día actual
        // y no puede tener registrada una fecha de finalización.
        return $query->whereDate($this->field, '<', now())
            ->whereNull('completed_at');
    }
}
