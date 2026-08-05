<?php

namespace Database\Seeders;

use App\Models\Label;
use Illuminate\Database\Seeder;

class LabelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Label::insert([
            ['name' => 'Confirmada', 'color' => '#37B24D'],
            ['name' => 'Estimada', 'color' => '#AE3EC9'],
            ['name' => 'Bloqueada', 'color' => '#F03E3E'],
            ['name' => 'Bug', 'color' => '#D6336C'],
            ['name' => 'Rehacer', 'color' => '#F76707'],
        ]);
    }
}
