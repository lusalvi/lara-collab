<?php

namespace App\Services;

// Obtiene y formatea notificaciones del usuario autenticado
class NotificationService
{
   // Retorna últimas notificaciones, null si no está autenticado
    public static function getLatest(int $limit)
    {
        if (! auth()->check()) {
            return null;
        }
        /** @var User */
        $user = auth()->user();

        return $user
            ->notifications()
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($notification) {
                return [
                    ...$notification->data,
                    'id' => $notification->id,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                ];
            });
    }
}
