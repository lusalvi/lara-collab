<?php

namespace App\Http\Requests\Task;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['string:255'],
            'group_id' => ['exists:task_groups,id'],
            'assigned_to_user_id' => ['nullable', 'exists:users,id'],
            'description' => ['nullable'],
            'estimation' => ['nullable'],
            'priority_id' => ['nullable', 'exists:task_priorities,id'],
            'start_on' => ['nullable'],
            'due_on' => ['nullable'],
            'hidden_from_clients' => ['boolean'],
            'subscribed_users' => ['array'],
            'labels' => ['array'],
        ];
    }
}
