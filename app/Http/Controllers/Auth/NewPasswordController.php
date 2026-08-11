<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador para restablecer la contraseña a partir de un token de reset.
 */
class NewPasswordController extends Controller
{
    /**
     * Muestra el formulario para ingresar la nueva contraseña.
     *
     * Recibe el token y el email desde la URL del enlace enviado por correo.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
    }

    /**
     * Valida el token y actualiza la contraseña del usuario.
     *
     * Si el reset es exitoso, redirige al login con aviso. En caso de token inválido,
     * lanza un error de validación con un mensaje en español.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            return redirect()->route('auth.login.form')->with(['notify' => 'password-reset']);
        }

        // Mapeo de códigos de error de Laravel a mensajes en español
        $message = match ($status) {
            'passwords.token' => 'El token de restablecimiento de contraseña es inválido.',
            default => 'Ups, algo salió mal.',
        };

        throw ValidationException::withMessages([
            'email' => [$message],
        ]);
    }
}
