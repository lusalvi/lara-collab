<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'job_title' => fake()->randomElement(['Frontend Developer', 'Backend Developer', 'Fullstack Developer', 'QA Engineer', 'Designer', 'Manager']),
            'avatar' => null,
            'password' => bcrypt('password'), // password
            'remember_token' => Str::random(10),
        ];
    }
}
