<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ForceDeleteService
{
    /**
     * Borra permanentemente una colección de proyectos archivados y todo su contenido asociado
     * (task groups, tasks con sus adjuntos/comentarios/labels/subscripciones, notas, accesos y actividades).
     */
    public function forceDeleteProjects(iterable $projects): int
    {
        $count = 0;

        DB::transaction(function () use ($projects, &$count) {
            foreach ($projects as $project) {
                $this->forceDeleteProject($project);
                $count++;
            }
        });

        return $count;
    }

    protected function forceDeleteProject(Project $project): void
    {
        // Solo se recorren las tasks raíz: forceDeleteTask baja recursivamente por sus hijas.
        Task::withArchived()
            ->where('project_id', $project->id)
            ->whereNull('parent_task_id')
            ->get()
            ->each(fn (Task $task) => $this->forceDeleteTask($task));

        $project->taskGroups()->withArchived()->delete();

        // notes tiene cascadeOnDelete real, pero lo hacemos explícito por claridad.
        $project->notes()->delete();

        DB::table('project_user_access')->where('project_id', $project->id)->delete();

        $project->activities()->delete();

        $project->delete();
    }

    /**
     * Borra permanentemente una tarea, sus subtareas (recursivo) y todo lo relacionado de ellas.
     */
    public function forceDeleteTask(Task $task): void
    {
        $task->children()->withArchived()->get()->each(fn (Task $child) => $this->forceDeleteTask($child));

        foreach ($task->attachments as $attachment) {
            File::delete(public_path($attachment->path));

            if ($attachment->thumb) {
                File::delete(public_path($attachment->thumb));
            }
        }
        $task->attachments()->delete();

        $task->comments()->delete();

        $task->labels()->detach();
        $task->subscribedUsers()->detach();

        $task->activities()->delete();

        $task->delete();
    }

    /**
     * Borra permanentemente task groups archivados.
     * Un task group solo puede archivarse si ya no tiene tasks, así que no requiere cascada.
     */
    public function forceDeleteTaskGroups(iterable $taskGroups): int
    {
        $count = 0;

        DB::transaction(function () use ($taskGroups, &$count) {
            foreach ($taskGroups as $taskGroup) {
                $taskGroup->delete();
                $count++;
            }
        });

        return $count;
    }

    /**
     * Borra permanentemente labels archivados, desetiquetando las tasks que los usaban.
     */
    public function forceDeleteLabels(iterable $labels): int
    {
        $count = 0;

        DB::transaction(function () use ($labels, &$count) {
            foreach ($labels as $label) {
                DB::table('label_task')->where('label_id', $label->id)->delete();
                $label->delete();
                $count++;
            }
        });

        return $count;
    }

    /**
     * Borra permanentemente roles archivados.
     * Un rol solo puede archivarse si no tiene usuarios asignados, así que no requiere cascada.
     */
    public function forceDeleteRoles(iterable $roles): int
    {
        $count = 0;

        DB::transaction(function () use ($roles, &$count) {
            foreach ($roles as $role) {
                $role->delete();
                $count++;
            }
        });

        return $count;
    }

    /**
     * Borra permanentemente áreas archivadas.
     * Solo se permite si el área ya no tiene proyectos ni usuarios asociados (se valida antes, en el controller/policy).
     */
    public function forceDeleteAreas(iterable $areas): int
    {
        $count = 0;

        DB::transaction(function () use ($areas, &$count) {
            foreach ($areas as $area) {
                $area->delete();
                $count++;
            }
        });

        return $count;
    }

    /**
     * Borra permanentemente usuarios archivados, desvinculando (sin borrar) todo su historial:
     * comentarios, adjuntos, tasks creadas/asignadas y actividades quedan con user_id en null.
     */
    public function forceDeleteUsers(iterable $users): int
    {
        $count = 0;

        DB::transaction(function () use ($users, &$count) {
            foreach ($users as $user) {
                $this->forceDeleteUser($user);
                $count++;
            }
        });

        return $count;
    }

    // Desvincula comentarios, adjuntos, actividades, tasks; elimina acceso y suscripciones
    protected function forceDeleteUser(User $user): void
    {
        DB::table('comments')->where('user_id', $user->id)->update(['user_id' => null]);
        DB::table('attachments')->where('user_id', $user->id)->update(['user_id' => null]);
        DB::table('activities')->where('user_id', $user->id)->update(['user_id' => null]);
        DB::table('tasks')->where('created_by_user_id', $user->id)->update(['created_by_user_id' => null]);
        DB::table('tasks')->where('assigned_to_user_id', $user->id)->update(['assigned_to_user_id' => null]);

        DB::table('project_user_access')->where('user_id', $user->id)->delete();
        $user->subscribedToTasks()->detach();

        $user->delete();
    }
}
