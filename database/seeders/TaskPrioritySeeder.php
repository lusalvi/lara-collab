<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\TaskPriority;
use Illuminate\Database\Seeder;

class TaskPrioritySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        TaskPriority::create(['label' => 'Alta', 'color' => '#FF0000', 'order' => 1]);
        TaskPriority::create(['label' => 'Media', 'color' => '#EDD118', 'order' => 2]);
        TaskPriority::create(['label' => 'Baja', 'color' => '#309E44', 'order' => 3]);

        // assign permissions to admin role
        $adminRole = Role::where('name', 'admin')->first();

        $adminRole->givePermissionTo('view task priority');
        $adminRole->givePermissionTo('create task priority');
        $adminRole->givePermissionTo('edit task priority');
        $adminRole->givePermissionTo('delete task priority');
        $adminRole->givePermissionTo('restore task priority');
    }
}
