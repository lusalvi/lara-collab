<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * Controlador de autenticación mediante Google (OAuth 2.0 via Socialite).
 *
 * Soporta dos casos al recibir el callback:
 * 1. El usuario ya tiene google_id registrado → login directo.
 * 2. El usuario existe por email pero sin google_id → vincula el ID y hace login.
 * 3. El usuario no existe en el sistema → redirige con aviso de cuenta no encontrada.
 */
class GoogleSocialiteController extends Controller
{
    /**
     * Redirige al proveedor de Google para iniciar el flujo OAuth.
     *
     * @return RedirectResponse
     */
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

      /**
     * Procesa el callback de Google tras la autenticación OAuth.
     *
     * @return RedirectResponse
     */
    public function handleCallback(): RedirectResponse
    {
        try {
            $user = Socialite::driver('google')->user();
            $findUser = User::where('google_id', $user->id)->first();

            // Caso 1: usuario ya vinculado con Google
            if ($findUser) {
                Auth::login($findUser);

                return redirect()->route('dashboard');
            }

            // Caso 2: el email ya existe pero no tiene google_id → vincular cuenta
            $findUser = User::where('email', $user->email)->first();

            if ($findUser) {
                $findUser->update(['google_id' => $user->id]);
                Auth::login($findUser);

                return redirect()->route('dashboard');
            }

            // Caso 3: usuario no registrado en el sistema
            return redirect()->route('auth.login.form')->with(['notify' => 'social-login-user-not-found']);
        } catch (Exception $e) {
            Log::error('Social login with google has failed', ['message' => $e->getMessage()]);

            return redirect()->route('auth.login.form')->with(['notify' => 'social-login-failed']);
        }
    }
}
