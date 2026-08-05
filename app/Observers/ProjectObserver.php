<?php

namespace App\Observers;

use App\Models\Project;

class ProjectObserver
{
    /**
     * Handle the Project "created" event.
     */
    public function created(Project $project): void
    {
        $project->activities()->create([
            'project_id' => $project->id,
            'user_id' => auth()->id(),
            'title' => 'Nuevo proyecto',
            'subtitle' => "El proyecto \"{$project->name}\" fue creado por ".auth()->user()->name,
        ]);
    }

    /**
     * Handle the Project "updated" event.
     */
    public function updated(Project $project): void
    {
        if ($project->isDirty(['name'])) {
            $project->activities()->create([
                'project_id' => $project->id,
                'user_id' => auth()->id(),
                'title' => 'Nombre del proyecto actualizado',
                'subtitle' => "El nombre del proyecto cambió de \"{$project->getOriginal('name')}\" a \"{$project->name}\" por ".auth()->user()->name,
            ]);
        }
    }

    /**
     * Handle the Project "archived" event.
     */
    public function archived(Project $project): void
    {
        $project->activities()->create([
            'project_id' => $project->id,
            'user_id' => auth()->id(),
            'title' => 'Proyecto archivado',
            'subtitle' => "El proyecto \"{$project->name}\" fue archivado por ".auth()->user()->name,
        ]);
    }

    /**
     * Handle the Project "unArchived" event.
     */
    public function unArchived(Project $project): void
    {
        $project->activities()->create([
            'project_id' => $project->id,
            'user_id' => auth()->id(),
            'title' => 'Proyecto desarchivado',
            'subtitle' => "El proyecto \"{$project->name}\" fue desarchivado por ".auth()->user()->name,
        ]);
    }
}
