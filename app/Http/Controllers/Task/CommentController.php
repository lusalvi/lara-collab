<?php

namespace App\Http\Controllers\Task;

use App\Events\Task\CommentCreated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Comment\StoreCommentRequest;
use App\Models\Comment;
use App\Models\Project;
use App\Models\Task;

/**
 * Controlador de comentarios de tareas.
 */
class CommentController extends Controller
{
    /**
     * Devuelve los comentarios de una tarea ordenados del más reciente al más antiguo.
     *
     * @param  Project  $project
     * @param  Task     $task
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Project $project, Task $task)
    {
        $this->authorize('viewAny', [Comment::class, $project]);

        return response()->json(
            $task->comments()->with(['user:id,name,avatar,job_title'])->latest()->get(),
        );
    }

    /**
     * Crea un nuevo comentario en la tarea y dispara el evento de notificación.
     *
     * @param  StoreCommentRequest  $request
     * @param  Project              $project
     * @param  Task                 $task
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreCommentRequest $request, Project $project, Task $task)
    {
        $this->authorize('create', [Comment::class, $project]);

        $comment = $task->comments()->create(
            $request->validated() + ['user_id' => auth()->id()]
        );

        CommentCreated::dispatch($comment);

        return response()->json(['comment' => $comment->load(['user:id,name,avatar,job_title'])]);
    }
}
