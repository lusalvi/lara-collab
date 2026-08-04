<?php

namespace App\Http\Resources\Label;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LabelResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'color' => $this->color,
            'can_restore' => $this->archived_at ? $request->user()?->can('restore', $this->resource) : null,
            'can_force_delete' => $this->archived_at ? $request->user()?->can('forceDelete', $this->resource) : null,
        ];
    }
}
