<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador de autenticación por formulario (sesión web).
 */
class AuthenticationController extends Controller
{
    /**
     * Muestra el formulario de inicio de sesión.
     *
     * Pasa la variable `notify` de la sesión para mostrar alertas contextuales
     * (ej: "sesión expirada", "login con Google fallido").
     *
     * @return Response
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', ['notify' => session('notify')]);
    }

    /**
     * Procesa las credenciales y autentica al usuario.
     *
     * Delega la validación de credenciales al LoginRequest y regenera la sesión
     * para prevenir ataques de fijación de sesión.
     *
     * @param  LoginRequest  $request
     * @return RedirectResponse
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(RouteServiceProvider::HOME);
    }

    /**
     * Cierra la sesión del usuario autenticado.
     *
     * Invalida la sesión y regenera el token CSRF.
     *
     * @param  Request  $request
     * @return RedirectResponse
     */
    public function destroy(Request $request): RedirectResponse
    {
        auth()->guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('auth.login.form');
    }
}
