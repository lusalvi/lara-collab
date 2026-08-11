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

/**
 * Controlador de usuarios del sistema.
 *
 * Gestiona el CRUD de usuarios con filtro por área según rol:
 * el superadmin ve todos los usuarios, el admin de área solo ve los de la suya.
 * Incluye protecciones para evitar que un usuario se archive o elimine a sí mismo.
 */
class UserController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(User::class, 'user');
    }

    /**
     * Muestra el listado de usuarios paginado.
     *
     * El superadmin ve todos los usuarios; el admin de área solo los de su área.
     *
     * @param  Request  $request  Puede contener: search, sort, archived.
     * @return Response
     */
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

    /**
     * Muestra el formulario de creación de usuario.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('Users/Create');
    }

    /**
     * Crea un nuevo usuario en el sistema.
     *
     * Delega la lógica de creación (envío de email de bienvenida, hash de contraseña)
     * al Action CreateUser.
     *
     * @param  StoreUserRequest  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(StoreUserRequest $request)
    {
        (new CreateUser)->create($request->validated());

        return redirect()->route('users.index')->success('Usuario creado', 'Un nuevo usuario se creó con éxito.');
    }

    /**
     * Muestra el formulario de edición de un usuario.
     *
     * @param  User  $user
     * @return \Inertia\Response
     */
    public function edit(User $user)
    {
        return Inertia::render('Users/Edit', ['item' => new UserResource($user)]);
    }

    /**
     * Actualiza los datos de un usuario existente.
     *
     * @param  User              $user
     * @param  UpdateUserRequest $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(User $user, UpdateUserRequest $request)
    {
        (new UpdateUser)->update($user, $request->validated());

        return redirect()->route('users.index')->success('Usuario actualizado', 'El usuario se actualizó con éxito.');
    }

    /**
     * Archiva un usuario (soft delete).
     *
     * Protección: un usuario no puede archivarse a sí mismo.
     *
     * @param  User  $user
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return redirect()->route('users.index')->warning('Acción Detenida', 'No es posible archivar el usuario con el que actualmente has iniciado sesión.');
        }
        $user->update(['archived_by_id' => auth()->id()]);
        $user->archive();

        return redirect()->back()->success('Usuario archivado', 'El usuario se archivó con éxito.');
    }

    /**
     * Restaura un usuario archivado.
     *
     * @param  int  $userId  ID del usuario (buscado incluido en archivados).
     * @return \Illuminate\Http\RedirectResponse
     */
    public function restore(int $userId)
    {
        $user = User::withArchived()->findOrFail($userId);

        $this->authorize('restore', $user);

        $user->unArchive();
        $user->update(['archived_by_id' => null]);

        return redirect()->back()->success('Usuario Restaurado', 'La restauración del usuario se realizó con éxito.');
    }

     /**
     * Elimina permanentemente un lote de usuarios archivados.
     *
     * Protección: no se puede eliminar al usuario autenticado,
     * incluso si está incluido en la lista.
     *
     * @param  Request             $request            Contiene: ids (array de IDs a eliminar).
     * @param  ForceDeleteService  $forceDeleteService
     * @return \Illuminate\Http\RedirectResponse
     */
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
