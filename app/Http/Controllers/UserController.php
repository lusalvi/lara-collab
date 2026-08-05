<?php

namespace App\Http\Controllers;

use App\Actions\User\CreateUser;
use App\Actions\User\UpdateUser;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\User\UserResource;
use App\Models\User;
use App\Services\ForceDeleteService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(User::class, 'user');
    }

    public function index(Request $request): Response
    {
        /** @var User $authUser */
        $authUser = $request->user();

        return Inertia::render('Users/Index', [
            'items' => UserResource::collection(
                User::searchByQueryString()
                    ->sortByQueryString()
                    ->with(['roles:id,name', 'area:id,name'])
                    ->when(! $authUser->isSuperAdmin(), fn ($q) => $q->where('area_id', $authUser->area_id))
                    ->when($request->has('archived'), fn ($query) => $query->onlyArchived())
                    ->paginate(12)
            ),
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create');
    }

    public function store(StoreUserRequest $request)
    {
        (new CreateUser)->create($request->validated());

        return redirect()->route('users.index')->success('Usuario creado', 'Un nuevo usuario se creó con éxito.');
    }

    public function edit(User $user)
    {
        return Inertia::render('Users/Edit', ['item' => new UserResource($user)]);
    }

    public function update(User $user, UpdateUserRequest $request)
    {
        (new UpdateUser)->update($user, $request->validated());

        return redirect()->route('users.index')->success('Usuario actualizado', 'El usuario se actualizó con éxito.');
    }

    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return redirect()->route('users.index')->warning('Acción Detenida', 'No es posible archivar el usuario con el que actualmente has iniciado sesión.');
        }
        $user->update(['archived_by_id' => auth()->id()]);
        $user->archive();

        return redirect()->back()->success('Usuario archivado', 'El usuario se archivó con éxito.');
    }

    public function restore(int $userId)
    {
        $user = User::withArchived()->findOrFail($userId);

        $this->authorize('restore', $user);

        $user->unArchive();
        $user->update(['archived_by_id' => null]);

        return redirect()->back()->success('Usuario Restaurado', 'La restauración del usuario se realizó con éxito.');
    }

    public function bulkForceDelete(Request $request, ForceDeleteService $forceDeleteService)
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:users,id'],
        ]);

        if (in_array(auth()->id(), $request->ids)) {
            return redirect()->route('users.index')->warning('Acción Detenida', 'No es posible eliminar permanentemente el usuario con el que actualmente has iniciado sesión.');
        }

        $users = User::onlyArchived()->whereIn('id', $request->ids)->get();

        foreach ($users as $user) {
            $this->authorize('forceDelete', $user);
        }

        $deletedCount = $forceDeleteService->forceDeleteUsers($users);

        return redirect()->back()->success(
            'Usuario Eliminado',
            "{$deletedCount} usuario(s) fueron eliminados permanentemente."
        );
    }
}
