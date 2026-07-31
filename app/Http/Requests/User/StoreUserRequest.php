<?php

namespace App\Http\Requests\User;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class StoreUserRequest extends FormRequest
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
            'job_title' => 'required|string',
            'name' => 'required|string',
            'phone' => 'string|nullable',
            'email' => ['required', 'email:rfc,dns', Rule::unique('users')],
            'password' => 'required|min:8|confirmed',
            'roles' => [
                'required',
                'array',
                'min:1',
                function ($attribute, $value, $fail) {
                    $authUser = auth()->user();
                    if ($authUser->isSuperAdmin()) return; 

                    $forbidden = ['superadmin', 'admin'];
                    foreach ($value as $role) {
                        if (in_array($role, $forbidden)) {
                            $fail("No tenés permisos para asignar el rol '$role'.");
                        }
                    }
                },
            ],
            'avatar' => [File::image(), 'nullable'],
            'area_id'  => 'required|exists:areas,id',
        ];
    }
}
