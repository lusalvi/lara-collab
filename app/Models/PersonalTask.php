<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Tarea personal de un usuario (agenda personal).
 *
 * Independiente de proyectos. Solo visible para el usuario dueño.
 *
 * Nomenclatura de campos:
 *   - description    → título de la tarea (nombre heredado, no se renombra)
 *   - notes          → descripción/detalle opcional
 *   - scheduled_for  → fecha programada (date)
 *   - scheduled_time → hora opcional (time|null). Si es null, la tarea es solo de fecha.
 *   - scheduled_end_time → hora de fin opcional (time|null). Solo tiene sentido con scheduled_time:
 *       sin fin = horario puntual; con fin = rango horario.
 *
 * Recordatorio (opcional, interno):
 *   - reminder_minutes → anticipación elegida (ver REMINDER_OPTIONS). null = sin recordatorio.
 *   - remind_at → momento en que corresponde notificar; lo recalcula PersonalTaskObserver.
 *   - reminder_notified_at → cuándo se envió (una sola vez por programación).
 *   Siempre se calcula sobre la hora de comienzo (scheduled_time), también en rangos.
 *
 * Navegación de fechas:
 *   Los scopes reciben una $date Carbon para poder usarse con cualquier fecha,
 *   no solo con now(). Esto permite la navegación entre días en el frontend.
 *
 * Arrastre lazy (solo aplica al ver el día de HOY):
 *   Las tareas pendientes con scheduled_for < hoy siguen apareciendo como
 *   "Pendientes anteriores" hasta que se completen. No se reprograman.
 *   Al navegar a otro día se ven solo las tareas de ese día.
 */
class PersonalTask extends Model
{
    /** Anticipaciones permitidas para el recordatorio, en minutos. */
    public const REMINDER_OPTIONS = [5, 15, 30, 60];

    /**
     * Tolerancia (minutos) para enviar un recordatorio ya vencido. Absorbe el desfase
     * del scheduler; pasado ese margen el recordatorio se descarta (no se envía atrasado).
     */
    public const REMINDER_TOLERANCE_MINUTES = 2;

    protected $fillable = [
        'user_id',
        'priority_id',
        'description',
        'notes',
        'scheduled_for',
        'scheduled_time',
        'scheduled_end_time',
        'reminder_minutes',
        'remind_at',
        'reminder_notified_at',
        'completed_at',
        'order_column',
    ];

    protected $casts = [
        'scheduled_for' => 'date',
        'completed_at' => 'datetime',
        'remind_at' => 'datetime',
        'reminder_notified_at' => 'datetime',
    ];

    // ─── Relaciones ────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function priority(): BelongsTo
    {
        return $this->belongsTo(TaskPriority::class, 'priority_id');
    }

    // ─── Recordatorio ──────────────────────────────────────────────

    /**
     * Momento de comienzo de la tarea (fecha + hora de comienzo), o null si no tiene hora.
     * Para rangos horarios es siempre la hora de comienzo, nunca la de fin.
     */
    public function startsAt(): ?Carbon
    {
        if (! $this->scheduled_time || ! $this->scheduled_for) {
            return null;
        }

        return Carbon::parse(
            $this->scheduled_for->toDateString().' '.substr($this->scheduled_time, 0, 5),
            config('app.timezone')
        );
    }

    /**
     * Recalcula remind_at según fecha, hora de comienzo y anticipación.
     * Lo invoca PersonalTaskObserver al guardar.
     *
     *   - Sin hora de comienzo o sin anticipación → sin recordatorio.
     *   - Momento ya pasado → remind_at null (la tarea se conserva, no hay aviso atrasado).
     *   - Cada recálculo vuelve a habilitar el envío (reminder_notified_at = null).
     */
    public function syncReminder(): void
    {
        $startsAt = $this->startsAt();

        if (! $this->reminder_minutes || ! $startsAt) {
            $this->reminder_minutes = null;
            $this->remind_at = null;
            $this->reminder_notified_at = null;

            return;
        }

        $remindAt = $startsAt->copy()->subMinutes((int) $this->reminder_minutes);

        $this->remind_at = $remindAt->isFuture() ? $remindAt : null;
        $this->reminder_notified_at = null;
    }

    /**
     * Recordatorios que corresponde enviar ahora: vencidos hace no más de la tolerancia,
     * sin enviar y con la tarea sin completar. Las tareas de días anteriores nunca entran
     * porque remind_at se calcula una sola vez, al guardar.
     */
    public function scopeReminderDue(Builder $query): Builder
    {
        return $query
            ->whereNull('completed_at')
            ->whereNull('reminder_notified_at')
            ->whereNotNull('remind_at')
            ->where('remind_at', '<=', now())
            ->where('remind_at', '>=', now()->subMinutes(self::REMINDER_TOLERANCE_MINUTES));
    }

    /**
     * Recordatorios pendientes cuyo momento ya pasó más allá de la tolerancia.
     */
    public function scopeReminderExpired(Builder $query): Builder
    {
        return $query
            ->whereNotNull('remind_at')
            ->whereNull('reminder_notified_at')
            ->where('remind_at', '<', now()->subMinutes(self::REMINDER_TOLERANCE_MINUTES));
    }

    // ─── Scopes parametrizados por fecha ───────────────────────────

    /**
     * Tareas pendientes programadas exactamente para $date.
     */
    public function scopePendingForDate(Builder $query, Carbon $date): Builder
    {
        return $query
            ->whereNull('completed_at')
            ->whereDate('scheduled_for', $date);
    }

    /**
     * Tareas pendientes de días anteriores a $date (arrastre lazy).
     * Solo se usa al ver el día de hoy; al navegar a otro día no aplica.
     */
    public function scopeOverdueAsOf(Builder $query, Carbon $date): Builder
    {
        return $query
            ->whereNull('completed_at')
            ->whereDate('scheduled_for', '<', $date);
    }

    /**
     * Tareas completadas en $date (usa completed_at, no scheduled_for).
     */
    public function scopeCompletedOn(Builder $query, Carbon $date): Builder
    {
        return $query
            ->whereNotNull('completed_at')
            ->whereDate('completed_at', $date);
    }

    // ─── Scopes legacy (mantienen compatibilidad si se usan en otro lado) ──

    public function scopePending(Builder $query): Builder
    {
        return $this->scopePendingForDate($query, now());
    }

    public function scopePendingToday(Builder $query): Builder
    {
        return $this->scopePendingForDate($query, now());
    }

    public function scopeOverdue(Builder $query): Builder
    {
        return $this->scopeOverdueAsOf($query, now());
    }

    public function scopeCompletedToday(Builder $query): Builder
    {
        return $this->scopeCompletedOn($query, now());
    }
}
