<?php

namespace App\Actions\User;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Support\Facades\Hash;

/**
 * Acción responsable de actualizar el perfil del usuario autenticado.
 *
 * A diferencia de UpdateUser (usada por administradores), esta acción
 * no permite cambiar el área ni los roles del usuario: solo datos personales.
 */
class UpdateAuthUser
{
    /**
     * Actualiza los datos del perfil del usuario autenticado.
     *
     * Reglas de actualización:
     * - Avatar: se actualiza si el usuario no tiene uno, o si se envió un archivo nuevo.
     * - Contraseña: solo se actualiza si se envió un valor no vacío.
     *
     * @param  User   $user  El usuario autenticado que edita su propio perfil.
     * @param  array  $data  Datos validados: name, job_title, phone, email,
     *                       avatar (nullable), password (nullable).
     * @return bool          True si la actualización fue exitosa.
     */
    public function update($user, array $data): bool
    {
        $newData = [
            'name' => $data['name'],
            'job_title' => $data['job_title'],
            'phone' => $data['phone'],
            'email' => $data['email'],
            // Nota: area_id y roles NO se incluyen aquí (solo admins pueden cambiarlos)
        ];

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
