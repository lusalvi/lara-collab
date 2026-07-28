<?php

namespace App\Actions\Area;

use App\Models\Area;

class UpdateArea
{
    public function update(Area $area, array $data): bool
    {
        return $area->update($data);
    }
}
