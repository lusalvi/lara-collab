<?php

namespace App\Notifications;

use App\Enums\Queue;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public string $password)
    {
        $this->onQueue(Queue::EMAIL->value);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(config('app.name').' - Tu cuenta ha sido creada!')
            ->greeting("{$notifiable->getFirstName()}, bienvenida!")
            ->line('El administrador ha creado una cuenta para usted. Puede hacer clic en el botón de abajo para iniciar sesión con la contraseña proporcionada. Es recomendable cambiar la contraseña al iniciar sesión.')
            ->line("Contraseña actual: {$this->password}")
            ->action('Login', route('auth.login.form', ['email' => $notifiable->email]))
            ->salutation('Disfruta de LaraCollab');
    }
}
