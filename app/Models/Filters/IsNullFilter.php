<?php

namespace App\Models\Filters;

use Illuminate\Database\Eloquent\Builder;
use Lacodix\LaravelModelFilter\Filters\Filter;

/**
 * IsNullFilter
 *
 * Filtro reutilizable para obtener registros cuyo campo
 * especificado no contiene ningún valor.
 */
class IsNullFilter extends Filter
{
    public function __construct(protected string $field) {}

    /**
     * Aplica el filtro de valores nulos sobre la consulta.
     *
     * @param  Builder  $query  Consulta Eloquent a filtrar.
     * @return Builder Consulta modificada.
     */
    public function apply(Builder $query): Builder
    {
        return $query->whereNull($this->field);
    }
}
