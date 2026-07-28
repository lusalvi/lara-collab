<?php

namespace App\Actions\Area;

use App\Models\Area;

class CreateArea
{
    public function create(array $data): Area
    {
        return Area::create($data);
    }
}

