<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'email' => $this->email,
            'job_title' => $this->job_title,
            'avatar' => $this->avatar,
            'phone' => $this->phone,
            'roles' => $this->roles->map->only('name')->flatten()->toArray(),
            'area_id' => $this->area_id,
            'area' => $this->whenLoaded('area', fn () => ['id' => $this->area->id, 'name' => $this->area->name]),
            'can_force_delete' => $this->archived_at ? $request->user()?->can('forceDelete', $this->resource) : null,
        ];
    }
}