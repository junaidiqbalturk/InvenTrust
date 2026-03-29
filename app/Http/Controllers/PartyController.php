<?php

namespace App\Http\Controllers;

use App\Models\Party;
use Illuminate\Http\Request;

class PartyController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->get('type');
        if ($type) {
            return Party::where('type', $type)->get();
        }
        return Party::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'type' => 'required|in:customer,supplier',
            'phone' => 'nullable|string',
            'email' => 'nullable|string|email',
            'address' => 'nullable|string',
            'opening_balance' => 'nullable|numeric',
        ]);

        $validated['current_balance'] = $validated['opening_balance'] ?? 0;

        return Party::create($validated);
    }

    public function show(Party $party)
    {
        return $party->load(['ledgerEntries', 'invoices', 'purchases', 'payments']);
    }

    public function update(Request $request, Party $party)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'type' => 'sometimes|in:customer,supplier',
            'phone' => 'nullable|string',
            'email' => 'nullable|string|email',
            'address' => 'nullable|string',
            'opening_balance' => 'sometimes|numeric',
        ]);

        $party->update($validated);
        return $party;
    }

    public function destroy(Party $party)
    {
        $party->delete();
        return response()->noContent();
    }
}
