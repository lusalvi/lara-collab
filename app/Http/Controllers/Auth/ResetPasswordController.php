<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ResetPasswordController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

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
            'passwords.user' => "No se pudo encontrar un usuario con esa dirección de correo electrónico.",
            default => 'Ups, algo salió mal.',
        };

        throw ValidationException::withMessages([
            'email' => [$message],
        ]);
    }
}
