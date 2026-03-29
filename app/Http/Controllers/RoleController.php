<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    public function index()
    {
        return Role::with('permissions')->get();
    }

    public function permissions()
    {
        return Permission::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id'
        ]);

        return DB::transaction(function () use ($validated) {
            $role = Role::create([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'company_id' => auth()->user()->company_id
            ]);

            if (!empty($validated['permissions'])) {
                $role->permissions()->sync($validated['permissions']);
            }

            return $role->load('permissions');
        });
    }

    public function show(Role $role)
    {
        return $role->load('permissions');
    }

    public function update(Request $request, Role $role)
    {
        // Prevent editing global roles (where company_id is null)
        if (is_null($role->company_id)) {
            return response()->json(['message' => 'Global roles cannot be modified.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id'
        ]);

        return DB::transaction(function () use ($validated, $role) {
            $role->update([
                'name' => $validated['name'],
                'description' => $validated['description']
            ]);

            if (isset($validated['permissions'])) {
                $role->permissions()->sync($validated['permissions']);
            }

            return $role->load('permissions');
        });
    }

    public function destroy(Role $role)
    {
        if (is_null($role->company_id)) {
            return response()->json(['message' => 'Global roles cannot be deleted.'], 403);
        }

        $role->delete();
        return response()->noContent();
    }
}
