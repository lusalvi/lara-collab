<?php

namespace App\Models\Filters;

use Illuminate\Database\Eloquent\Builder;
use Lacodix\LaravelModelFilter\Filters\Filter;

/**
 * WhereInFilter
 *
 * Filtro reutilizable para obtener registros cuyo campo
 * coincida con alguno de los valores proporcionados.
 */
class WhereInFilter extends Filter
{
    public function __construct(protected string $field) {}

    /**
     * Aplica el filtro utilizando una lista de valores permitidos.
     *
     * @param  Builder  $query  Consulta Eloquent a filtrar.
     * @return Builder Consulta modificada.
     */
    public function apply(Builder $query): Builder
    {
        return $query->whereIn($this->field, $this->values);
    }
}
