<?php

namespace App\Models\Filters;

use Illuminate\Database\Eloquent\Builder;
use Lacodix\LaravelModelFilter\Filters\Filter;

/**
 * WhereHasFilter
 *
 * Filtro reutilizable para obtener registros que tengan
 * una relación asociada con alguno de los identificadores indicados.
 */
class WhereHasFilter extends Filter
{
    public function __construct(protected string $relation) {}

    /**
     * Aplica el filtro sobre una relación del modelo.
     *
     * @param Builder $query Consulta Eloquent a filtrar.
     * @return Builder Consulta modificada.
     */
    public function apply(Builder $query): Builder
    {
        return $query->whereHas($this->relation, function (Builder $query) {
            $query->whereIn('id', $this->values);
        });
    }
}
