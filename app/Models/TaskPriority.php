<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Prioridad asignable a una tarea.
 *
 * Contiene la etiqueta, el color y el orden utilizado
 * para representar y organizar las prioridades.
 */
class TaskPriority extends Model
{
    protected $fillable = ['label', 'color', 'order'];
}
