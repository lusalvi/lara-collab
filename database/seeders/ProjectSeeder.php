<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Project::create([
            'name' => 'Demo Project',
            'description' => fake()->sentence(),
            'area_id' => Area::first()->id,
        ]);

        Project::create([
            'name' => 'Demo Project 2',
            'description' => fake()->sentence(),
            'area_id' => Area::oldest()->first()->id,
        ]);
    }
}
