<?php

namespace App\Actions\Task;

use App\Events\Task\AttachmentsUploaded;
use App\Events\Task\TaskCreated;
use App\Models\Project;
use App\Models\Task;
use App\Notifications\TaskAssignedNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;
use Throwable;

/**
 * Acción responsable de crear tareas dentro de un proyecto,
 * incluyendo el manejo de archivos adjuntos y sus miniaturas.
 */
class CreateTask
{
    /**
     * Crea una nueva tarea asociada al proyecto dado.
     *
     * La operación se envuelve en una transacción de base de datos para garantizar
     * consistencia: si falla cualquier paso (adjuntos, etiquetas, suscriptores),
     * se revierte todo.
     *
     * @param  Project  $project  Proyecto al que pertenecerá la tarea.
     * @param  array  $data  Datos validados provenientes del request.
     * @return Task La tarea recién creada.
     */
    public function create(Project $project, array $data): Task
    {
        return DB::transaction(function () use ($project, $data) {

            $task = $project->tasks()->create([
                'group_id' => $data['group_id'],
                'created_by_user_id' => auth()->id(),
                'assigned_to_user_id' => $data['assigned_to_user_id'],
                'name' => $data['name'],
                // El número de tarea es secuencial por proyecto, incluyendo archivadas
                'number' => $project->tasks()->withArchived()->count() + 1,
                'issue_type' => $data['issue_type'],
                'parent_task_id' => $data['parent_task_id'] ?? null,
                'description' => $data['description'],
                'start_on' => $data['start_on'],
                'due_on' => $data['due_on'],
                'priority_id' => $data['priority_id'] ?? null,
                'completed_at' => null,
            ]);

            // Asociar usuarios suscriptos (notificaciones de actividad)
            $task->subscribedUsers()->attach($data['subscribed_users'] ?? []);

            // Asociar etiquetas
            $task->labels()->attach($data['labels'] ?? []);

            // Subir adjuntos si se enviaron (sin disparar el evento aún,
            // ya que TaskCreated se despacha después)
            if (! empty($data['attachments'])) {
                $this->uploadAttachments($task, $data['attachments'], false);
            }

            if ($task->assigned_to_user_id && $task->assigned_to_user_id !== auth()->id()) {
                $task->assignedToUser->notify(new TaskAssignedNotification($task));
            }

            TaskCreated::dispatch($task);

            return $task;
        });
    }

    /**
     * Sube una lista de archivos adjuntos a la tarea, genera sus miniaturas
     * y registra una actividad. Opcionalmente despacha el evento de adjuntos.
     *
     * @param  Task  $task  Tarea destino.
     * @param  array  $items  Archivos a subir (instancias de UploadedFile).
     * @param  bool  $dispatchEvent  Si es true, despacha AttachmentsUploaded al terminar.
     * @return Collection Colección de adjuntos creados.
     */
    public function uploadAttachments(Task $task, array $items, $dispatchEvent = true): Collection
    {
        $rows = collect($items)
            ->map(function (UploadedFile $item) use ($task) {
                // Nombre de archivo en minúsculas con ULID para evitar colisiones
                $filename = strtolower(Str::ulid()).'.'.$item->getClientOriginalExtension();
                $filepath = "tasks/{$task->id}/{$filename}";

                $item->storeAs('public', $filepath);

                // Intentar generar miniatura (solo para imágenes)
                $thumbFilepath = $this->generateThumb($item, $task, $filename);

                return [
                    'user_id' => auth()->id(),
                    'name' => $item->getClientOriginalName(),
                    'path' => "/storage/$filepath",
                    'thumb' => $thumbFilepath ? "/storage/$thumbFilepath" : null,
                    'type' => $item->getClientMimeType(),
                    'size' => $item->getSize(),
                ];
            });

        $attachments = $task->attachments()->createMany($rows);

        // Registrar actividad de carga en el historial de la tarea
        $task->activities()->create([
            'project_id' => $task->project_id,
            'user_id' => auth()->id(),
            'title' => ($attachments->count() > 1 ? 'Attachments where' : 'Attachment was').' uploaded',
            'subtitle' => "to \"{$task->name}\" by ".auth()->user()->name,
        ]);

        if ($dispatchEvent) {
            AttachmentsUploaded::dispatch($task, $attachments);
        }

        return $attachments;
    }

    /**
     * Genera una miniatura de 100×100 px para archivos de imagen.
     *
     * Devuelve null si el archivo no es una imagen compatible o si
     * la generación falla (por ejemplo, imagen corrupta).
     *
     * @param  UploadedFile  $file  Archivo subido.
     * @param  Task  $task  Tarea propietaria (usada para construir la ruta).
     * @param  string  $filename  Nombre de archivo ya generado para la imagen original.
     * @return string|null Ruta relativa a storage de la miniatura, o null.
     */
    protected function generateThumb(UploadedFile $file, Task $task, string $filename)
    {
        if (in_array($file->getClientOriginalExtension(), ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'])) {
            try {
                $thumbFilepath = "tasks/{$task->id}/thumbs/{$filename}";

                // fit() recorta y escala al centro para mantener la proporción
                $image = Image::make($file->get())
                    ->fit(100, 100)
                    ->encode(null, 75);

                Storage::put("public/$thumbFilepath", $image);

                return $thumbFilepath;
            } catch (Throwable $e) {
                // Si falla la generación de miniatura, no interrumpir la carga principal
                return null;
            }
        }

        return null;
    }
}
