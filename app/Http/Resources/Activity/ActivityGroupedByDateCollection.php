<?php

namespace App\Http\Resources\Activity;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class ActivityGroupedByDateCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return $this
            ->collection
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'activity_capable' => $activity->activityCapable,
                    'project' => $activity->project,
                    'title' => $activity->title,
                    'subtitle' => $activity->subtitle,
                    'created_at' => $activity->created_at,
                    'date' => $activity->created_at->locale('es')->isoFormat('D [de] MMMM [de] YYYY'),
                ];
            })
            ->groupBy('date')
            ->toArray();
    }
}
