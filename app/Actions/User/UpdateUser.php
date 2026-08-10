<?php

namespace App\Actions\User;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Support\Facades\Hash;

/**
 * Acción responsable de actualizar los datos de un usuario existente.
 *
 * Usada por administradores para editar cualquier usuario.
 * Para la edición del propio perfil, ver UpdateAuthUser.
 */
class UpdateUser
{
    /**
     * Actualiza los datos del usuario, sus roles y opcionalmente su avatar y contraseña.
     *
     * Reglas de actualización:
     * - Roles: siempre se sincronizan (syncRoles elimina los anteriores y asigna los nuevos).
     * - Avatar: se actualiza si el usuario no tiene uno, o si se envió un archivo nuevo.
     * - Contraseña: solo se actualiza si se envió un valor no vacío (permite editar sin cambiarla).
     *
     * @param  User   $user  Usuario a modificar.
     * @param  array  $data  Datos validados: name, job_title, phone, email, area_id,
     *                       roles[], avatar (nullable), password (nullable).
     * @return bool          True si la actualización fue exitosa.
     */
    public function update($user, array $data): bool
    {
        $newData = [
            'name' => $data['name'],
            'job_title' => $data['job_title'],
            'phone' => $data['phone'],
            'email' => $data['email'],
            'area_id' => $data['area_id'],
        ];

        // syncRoles reemplaza todos los roles actuales por los nuevos
        $user->syncRoles($data['roles']);

        // Actualizar avatar solo si no tiene uno aún, o si se envió uno nuevo
        if ($user->avatar === null || $data['avatar']) {
            $newData['avatar'] = UserService::storeOrFetchAvatar($user, $data['avatar']);
        }

        // La contraseña es opcional: si viene vacía, se conserva la actual
        if (! empty($data['password'])) {
            $newData['password'] = Hash::make($data['password']);
        }

        return $user->update($newData);
    }
}
