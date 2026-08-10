<?php

namespace App\Actions\Area;

use App\Models\Area;

/**
 * Acción responsable de crear una nueva área organizacional.
 *
 * Las áreas agrupan proyectos y usuarios dentro de la aplicación.
 * La validación de los datos debe realizarse antes de invocar esta acción
 * (típicamente en un Form Request).
 */
class CreateArea
{
    /**
     * Crea y persiste una nueva área con los datos provistos.
     *
     * @param  array  $data  Datos validados (nombre y cualquier otro campo fillable de Area).
     * @return Area          El área recién creada.
     */
    public function create(array $data): Area
    {
        return Area::create($data);
    }
}
