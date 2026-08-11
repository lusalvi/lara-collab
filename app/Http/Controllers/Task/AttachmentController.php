<?php

namespace App\Http\Controllers\Task;

use App\Actions\Task\CreateTask;
use App\Events\Task\AttachmentDeleted;
use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

/**
 * Controlador de adjuntos de tareas.
 *
 * Permite subir y eliminar archivos adjuntos a una tarea.
 * Los archivos se almacenan en disco; al eliminar se borran
 * tanto el archivo original como su miniatura (thumb).
 */
class AttachmentController extends Controller
{
    /**
     * Sube uno o más archivos adjuntos a una tarea.
     *
     * Se permiten hasta 10 archivos por solicitud, con un máximo de 5 MB cada uno.
     * Delega la lógica de almacenamiento al Action CreateTask.
     *
     * @param  Request  $request  Contiene: attachments (array de archivos).
     * @param  Project  $project
     * @param  Task     $task
     * @return JsonResponse
     */
    public function store(Request $request, Project $project, Task $task): JsonResponse
    {
        $this->authorize('viewAny', [Attachment::class, $project]);

        $request->validate([
            'attachments' => ['required', 'array', 'max:10'],
            'attachments.*' => ['file', 'max:5120'], // 5 MB por archivo
        ]);

        $files = (new CreateTask)->uploadAttachments($task, $request->attachments);

        return response()->json(['files' => $files]);
    }

    /**
     * Elimina un adjunto de la tarea y sus archivos del disco.
     *
     * Borra el archivo original y su miniatura, luego elimina el registro
     * de la base de datos y despacha el evento correspondiente.
     *
     * @param  Project     $project
     * @param  Task        $task
     * @param  Attachment  $attachment
     * @return JsonResponse
     */
    public function destroy(Project $project, Task $task, Attachment $attachment): JsonResponse
    {
        $this->authorize('delete', [$attachment, $project]);

        File::delete(public_path($attachment->path));
        File::delete(public_path($attachment->thumb));

        $attachment->delete();

        AttachmentDeleted::dispatch($task, $attachment->id);

        return response()->json();
    }
}
