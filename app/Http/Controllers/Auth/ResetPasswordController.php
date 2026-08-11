<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador para solicitar el enlace de restablecimiento de contraseña.
 */
class ResetPasswordController extends Controller
{
        /**
     * Muestra el formulario de solicitud de reset de contraseña.
     *
     * @return Response
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

        /**
     * Envía el enlace de restablecimiento al correo indicado.
     *
     * Si el email no existe o hay throttle, devuelve mensajes de error en español.
     *
     * @param  Request  $request
     * @return RedirectResponse
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status == Password::RESET_LINK_SENT) {
            return back()->with('status', 'Email con enlace de restablecimiento de contraseña enviado');
        }

        $message = match ($status) {
            'passwords.throttled' => 'Por favor, espere antes de volver a intentarlo.',
            'passwords.user' => 'No se pudo encontrar un usuario con esa dirección de correo electrónico.',
            default => 'Ups, algo salió mal.',
        };

        throw ValidationException::withMessages([
            'email' => [$message],
        ]);
    }
}
