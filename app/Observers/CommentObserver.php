<?php

namespace App\Observers;

use App\Models\Comment;

class CommentObserver
{
    /**
     * Handle the Comment "created" event.
     */
    public function created(Comment $comment): void
    {
        $comment->activities()->create([
            'project_id' => $comment->task->project_id,
            'user_id' => auth()->id(),
            'title' => 'Nuevo comentario',
            'subtitle' => auth()->user()->name . " dejó un comentario en la actividad \"{$comment->task->name}\"",
        ]);
    }
}
