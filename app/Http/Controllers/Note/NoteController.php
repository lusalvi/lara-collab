<?php

namespace App\Http\Controllers\Note;

use App\Http\Controllers\Controller;
use App\Http\Requests\Note\LockNoteRequest;
use App\Http\Requests\Note\RemoveLockNoteRequest;
use App\Http\Requests\Note\StoreNoteRequest;
use App\Http\Requests\Note\UnlockNoteRequest;
use App\Http\Requests\Note\UpdateNoteRequest;
use App\Models\Note;
use App\Models\Project;
use App\Services\NoteEncryption;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador de notas de proyecto.
 *
 * Las notas pueden estar en estado abierto o bloqueado. Las notas bloqueadas
 * tienen su contenido cifrado con un passcode; solo se descifran al momento
 * de desbloquear o editar, nunca se envían en texto plano al frontend.
 */
class NoteController extends Controller
{
    /**
     * Lista las notas del proyecto.
     *
     * Las notas bloqueadas se devuelven sin contenido (null) para evitar
     * exponer datos cifrados al frontend antes de que el usuario ingrese su passcode.
     *
     * @param  Request  $request
     * @param  Project  $project
     * @return Response
     */
    public function index(Request $request, Project $project): Response
    {
        $this->authorize('viewAny', [Note::class, $project]);

        $notes = $project->notes()
            ->latest('updated_at')
            ->get(['id', 'project_id', 'title', 'content', 'is_locked', 'created_at', 'updated_at'])
            ->each(function (Note $note) {
                // Se oculta el contenido de las notas bloqueadas: el frontend
                // lo solicita por separado al desbloquear con el passcode.
                if ($note->is_locked) {
                    $note->setAttribute('content', null);
                }
            });

        return Inertia::render('Projects/Notes/Index', [
            'project' => $project,
            'notes' => $notes,
        ]);
    }

    /**
     * Crea una nueva nota en el proyecto.
     *
     * @param  StoreNoteRequest  $request
     * @param  Project           $project
     * @return RedirectResponse
     */
    public function store(StoreNoteRequest $request, Project $project): RedirectResponse
    {
        $this->authorize('create', [Note::class, $project]);

        $project->notes()->create($request->validated());

        return redirect()->route('projects.notes', $project);
    }

    /**
     * Actualiza el contenido de una nota.
     *
     * Si la nota está bloqueada, valida el passcode antes de guardar.
     * El nuevo contenido se re-cifra automáticamente con el mismo salt existente.
     *
     * @param  UpdateNoteRequest  $request
     * @param  Project            $project
     * @param  Note               $note
     * @return RedirectResponse
     */
    public function update(UpdateNoteRequest $request, Project $project, Note $note): RedirectResponse
    {
        $this->authorize('update', [$note, $project]);

        $validated = $request->validated();

        if ($note->is_locked) {
            // Para editar una nota bloqueada se requiere el passcode correcto
            if (! NoteEncryption::isValidPasscode($validated['passcode'], $note->passcode_salt, $note->content)) {
                return redirect()->back()->error('Passcode Incorrecto', 'El passcode que ingresaste es incorrecto.');
            }

            // Se re-cifra el contenido actualizado con el mismo salt que ya tenía la nota
            $note->update([
                'title' => $validated['title'],
                'content' => NoteEncryption::encrypt($validated['passcode'], $note->passcode_salt, $validated['content'] ?? ''),
            ]);
        } else {
            $note->update([
                'title' => $validated['title'],
                'content' => $validated['content'] ?? '',
            ]);
        }

        return redirect()->route('projects.notes', $project)->success('Nota Guardada', 'La nota se guardó con éxito.');
    }

    /**
     * Bloquea una nota cifrando su contenido con un passcode.
     *
     * Genera un salt aleatorio para la derivación de la clave y cifra el contenido.
     * El passcode nunca se almacena; solo se guarda el salt y el contenido cifrado.
     *
     * @param  LockNoteRequest  $request
     * @param  Project          $project
     * @param  Note             $note
     * @return RedirectResponse
     */
    public function lock(LockNoteRequest $request, Project $project, Note $note): RedirectResponse
    {
        $this->authorize('update', [$note, $project]);

        if ($note->is_locked) {
            return redirect()->back()->error('Nota Bloqueada', 'La nota se bloqueó con éxito.');
        }

        $validated = $request->validated();
        $salt = NoteEncryption::generateSalt(); // Salt único para esta nota

        $note->update([
            'content' => NoteEncryption::encrypt($validated['passcode'], $salt, $validated['content'] ?? ''),
            'is_locked' => true,
            'passcode_salt' => $salt,
        ]);

        return redirect()->route('projects.notes', $project)->success('Nota Bloqueada', 'La nota se bloqueó con un passcode con éxito.');
    }

    /**
     * Descifra y devuelve el contenido de una nota bloqueada (sin guardar).
     *
     * Solo devuelve el contenido si el passcode es válido; no modifica el estado
     * de la nota en la base de datos.
     *
     * @param  UnlockNoteRequest  $request
     * @param  Project            $project
     * @param  Note               $note
     * @return JsonResponse
     */
    public function unlock(UnlockNoteRequest $request, Project $project, Note $note): JsonResponse
    {
        $this->authorize('viewAny', [Note::class, $project]);

        if (! NoteEncryption::isValidPasscode($request->validated('passcode'), $note->passcode_salt, $note->content)) {
            return response()->json(['message' => 'Incorrect passcode'], 422);
        }

        return response()->json([
            'content' => NoteEncryption::decrypt($request->validated('passcode'), $note->passcode_salt, $note->content),
        ]);
    }

    /**
     * Elimina el bloqueo de una nota, dejando su contenido en texto plano.
     *
     * Valida el passcode, descifra el contenido y guarda la nota sin cifrado.
     * Si el request incluye contenido editado, lo usa; si no, conserva el descifrado.
     *
     * @param  RemoveLockNoteRequest  $request
     * @param  Project                $project
     * @param  Note                   $note
     * @return RedirectResponse
     */
    public function removeLock(RemoveLockNoteRequest $request, Project $project, Note $note): RedirectResponse
    {
        $this->authorize('update', [$note, $project]);

        if (! NoteEncryption::isValidPasscode($request->validated('passcode'), $note->passcode_salt, $note->content)) {
            return redirect()->back()->error('Passcode Incorrecto', 'The passcode you entered is incorrect.');
        }

        $decrypted = NoteEncryption::decrypt($request->validated('passcode'), $note->passcode_salt, $note->content);

        $note->update([
            // Si el usuario editó contenido al remover el bloqueo, se guarda ese; si no, el descifrado original
            'content' => $request->validated('content') ?? $decrypted,
            'is_locked' => false,
            'passcode_salt' => null,
        ]);

        return redirect()->route('projects.notes', $project)->success('Bloqueo Eliminado', 'El bloqueo de la nota se eliminó con éxito.');
    }

    /**
     * Elimina una nota del proyecto.
     *
     * @param  Project  $project
     * @param  Note     $note
     * @return RedirectResponse
     */
    public function destroy(Project $project, Note $note): RedirectResponse
    {
        $this->authorize('delete', [$note, $project]);

        $note->delete();

        return redirect()->route('projects.notes', $project)->success('Nota Eliminada', 'La nota se eliminó con éxito.');
    }
}
