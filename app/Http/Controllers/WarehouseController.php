<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index()
    {
        return Warehouse::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
        ]);

        return Warehouse::create($validated);
    }

    public function update(Request $request, Warehouse $warehouse)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'location' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $warehouse->update($validated);
        return $warehouse;
    }

    public function destroy(Warehouse $warehouse)
    {
        // Check if there's stock or movements before deleting
        if ($warehouse->products()->exists()) {
            return response()->json(['message' => 'Cannot delete warehouse with existing stock.'], 422);
        }

        $warehouse->delete();
        return response()->noContent();
    }
}
