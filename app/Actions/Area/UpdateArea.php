<?php

namespace App\Actions\Area;

use App\Models\Area;

/**
 * Acción responsable de actualizar los datos de un área existente.
 */
class UpdateArea
{
    /**
     * Actualiza el área con los datos provistos.
     *
     * @param  Area  $area  Área a modificar.
     * @param  array  $data  Datos validados con los nuevos valores.
     * @return bool True si la actualización fue exitosa, false en caso contrario.
     */
    public function update(Area $area, array $data): bool
    {
        return $area->update($data);
    }
}
