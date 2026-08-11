<?php

namespace App\Models;

use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Spatie\Permission\Models\Permission as SpatiePermission;
/**
 * Permiso del sistema.
 *
 * Extiende el modelo de permisos de Spatie y agrega
 * auditoría de los cambios realizados sobre los permisos.
 */
class Permission extends SpatiePermission implements AuditableContract
{
    use Auditable;
}
