<?php

namespace App\Http\Controllers\Account;

use App\Actions\User\UpdateAuthUser;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateAuthUserRequest;
use App\Http\Resources\User\AuthUserResource;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador del perfil del usuario autenticado.
 */
class ProfileController extends Controller
{
    /**
     * Muestra el formulario de edición del perfil.
     *
     * @return Response
     */
    public function edit()
    {
        return Inertia::render('Account/Profile/Edit', [
            'user' => new AuthUserResource(auth()->user()),
        ]);
    }

    /**
     * Actualiza los datos del perfil del usuario autenticado.
     *
     * Delega la lógica de actualización (avatar, datos personales) al Action UpdateAuthUser.
     *
     * @return RedirectResponse
     */
    public function update(UpdateAuthUserRequest $request)
    {
        (new UpdateAuthUser)->update($request->user(), $request->validated());

        return redirect()->back()->success('Usuario Actualizado', 'El perfil de usuario se actualizó con éxito.');
    }
}
