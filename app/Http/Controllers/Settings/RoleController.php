<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Http\Resources\Role\RoleResource;
use App\Models\Role;
use App\Services\ForceDeleteService;
use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador de roles y permisos (Settings).
 *
 * Gestiona los roles del sistema usando Spatie Laravel Permission.
 * Un rol no puede archivarse ni eliminarse si todavía está asignado a usuarios.
 */
class RoleController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Role::class, 'role');
    }

    /**
     * Lista los roles con conteo de permisos asignados.
     *
     * @param  Request  $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Settings/Roles/Index', [
            'items' => RoleResource::collection(
                Role::searchByQueryString()
                    ->sortByQueryString()
                    ->when($request->has('archived'), fn ($query) => $query->onlyArchived()->with('archivedBy'))
                    ->withCount('permissions')
                    ->paginate(12),
            ),
        ]);
    }

    /**
     * Muestra el formulario de creación de rol con todos los permisos agrupados.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('Settings/Roles/Create', [
            'allPermissionsGrouped' => PermissionService::allPermissionsGrouped(),
        ]);
    }

    /**
     * Crea un nuevo rol y le asigna los permisos seleccionados.
     *
     * @param  StoreRoleRequest  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(StoreRoleRequest $request)
    {
        $role = Role::create(['name' => $request->name, 'guard_name' => 'web']);
        $role->syncPermissions($request->permissions);

        return redirect()->route('settings.roles.index')->success('Rol Creado', 'Un nuevo rol se creó con éxito.');
    }

    /**
     * Muestra el formulario de edición del rol con sus permisos actuales.
     *
     * @param  Role  $role
     * @return \Inertia\Response
     */
    public function edit(Role $role)
    {
        return Inertia::render('Settings/Roles/Edit', [
            'item' => new RoleResource($role),
            'allPermissionsGrouped' => PermissionService::allPermissionsGrouped(),
        ]);
    }

    /**
     * Actualiza el nombre y permisos de un rol.
     *
     * @param  Role              $role
     * @param  UpdateRoleRequest $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Role $role, UpdateRoleRequest $request)
    {
        $role->update(['name' => $request->name]);
        $role->syncPermissions($request->permissions);

        return redirect()->route('settings.roles.index')->success('Rol Actualizado', 'El rol se actualizó con éxito.');
    }

    /**
     * Archiva un rol.
     *
     * Bloquea el archivado si el rol está asignado a algún usuario activo.
     *
     * @param  Role  $role
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Role $role)
    {
        $usersWithRole = DB::table('model_has_roles')->where('role_id', $role->id)->exists();

        if ($usersWithRole) {
            return redirect()->route('settings.roles.index')->warning('Acción Detenida', 'No es posible archivar un rol que aún está asignado a usuarios.');
        }
        $role->update(['archived_by_id' => auth()->id()]);
        $role->archive();

        return redirect()->back()->success('Rol Archivado', 'El rol se archivó con éxito.');
    }

    /**
     * Restaura un rol archivado.
     *
     * @param  int  $roleId
     * @return \Illuminate\Http\RedirectResponse
     */
    public function restore(int $roleId)
    {
        $role = Role::withArchived()->findOrFail($roleId);

        $this->authorize('restore', $role);

        $role->unArchive();
        $role->update(['archived_by_id' => null]);

        return redirect()->back()->success('Rol Restaurado', 'La restauración del rol se realizó con éxito.');
    }

    /**
     * Elimina permanentemente un lote de roles archivados.
     *
     * Bloquea la eliminación de roles que aún tienen usuarios asignados.
     *
     * @param  Request             $request
     * @param  ForceDeleteService  $forceDeleteService
     * @return \Illuminate\Http\RedirectResponse
     */
    public function bulkForceDelete(Request $request, ForceDeleteService $forceDeleteService)
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:roles,id'],
        ]);

        $roles = Role::onlyArchived()->whereIn('id', $request->ids)->get();

        foreach ($roles as $role) {
            $this->authorize('forceDelete', $role);
        }

        $rolesWithUsers = $roles->filter(
            fn (Role $role) => DB::table('model_has_roles')->where('role_id', $role->id)->exists()
        );

        if ($rolesWithUsers->isNotEmpty()) {
            $names = $rolesWithUsers->pluck('name')->implode(', ');

            return redirect()->back()->warning(
                'Acción Detenida',
                "Los siguientes roles aún están asignados a usuarios: {$names}."
            );
        }

        $deletedCount = $forceDeleteService->forceDeleteRoles($roles);

        return redirect()->back()->success(
            'Roles Eliminados',
            "{$deletedCount} role(s) fueron eliminados permanentemente."
        );
    }
}
