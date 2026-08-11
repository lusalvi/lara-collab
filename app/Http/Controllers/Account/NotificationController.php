<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Resources\Notification\NotificationGroupedByDateCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador de notificaciones del usuario autenticado.
 *
 * Permite ver, marcar como leídas y eliminar notificaciones de la cuenta.
 */
class NotificationController extends Controller
{
    /**
     * Muestra las notificaciones del usuario agrupadas por fecha.
     */
    public function index(): Response
    {
        return Inertia::render('Account/Notifications/Index', [
            'groups' => new NotificationGroupedByDateCollection(
                auth()
                    ->user()
                    ->notifications()
                    ->latest()
                    ->get()
            ),
        ]);
    }

    /**
     * Marca una notificación específica como leída.
     *
     * Verifica que la notificación pertenezca al usuario autenticado
     * antes de marcarla, para evitar acceso cruzado entre usuarios.
     *
     * @return JsonResponse
     */
    public function read(DatabaseNotification $notification)
    {
        // Seguridad: verificar que la notificación corresponde al usuario autenticado
        if (
            $notification->notifiable_type !== auth()->user()->getMorphClass()
            || $notification->notifiable_id !== auth()->id()
        ) {
            abort(403);
        }

        $notification->markAsRead();

        return response()->json();
    }

    /**
     * Marca todas las notificaciones no leídas del usuario como leídas.
     *
     * @return JsonResponse
     */
    public function readAll()
    {
        auth()->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json();
    }

    /**
     * Elimina todas las notificaciones ya leídas del usuario.
     *
     * @return JsonResponse
     */
    public function destroyRead()
    {
        auth()->user()
            ->readNotifications()
            ->delete();

        return response()->json();
    }
}
