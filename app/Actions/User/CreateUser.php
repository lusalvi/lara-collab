<?php

namespace App\Actions\User;

use App\Events\UserCreated;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Acción responsable de crear un nuevo usuario en el sistema.
 *
 * Gestiona el hash de la contraseña, el avatar (subida o Gravatar),
 * la asignación de roles y el disparo del evento de bienvenida,
 * todo dentro de una transacción atómica.
 */
class CreateUser
{
    /**
     * Crea y persiste un nuevo usuario con sus roles y avatar.
     *
     * Si la transacción falla en cualquier punto (por ejemplo, al asignar roles),
     * se revierte la creación del usuario completa.
     *
     * @param  array  $data  Datos validados del request: name, job_title, phone, email,
     *                       password (en texto plano), area_id, roles[], avatar (opcional).
     * @return User          El usuario recién creado con sus roles asignados.
     */
    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'job_title' => $data['job_title'],
                'phone' => $data['phone'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'area_id' => $data['area_id'],
            ]);

            // Intentar subir avatar o recuperarlo de Gravatar; actualizar en el mismo paso
            $user->update(['avatar' => UserService::storeOrFetchAvatar($user, $data['avatar'])]);

            // Asignar uno o más roles (usa Spatie Permission internamente)
            $user->assignRole($data['roles']);

            // Notificar al usuario con sus credenciales de acceso
            UserCreated::dispatch($user, $data['password']);

            return $user;
        });
    }
}
