<?php
namespace App\Http\Controllers;
use App\Models\TaxRule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaxRuleController extends Controller
{
    public function index() {
        return Inertia::render('Settings/Taxes', [
            'taxRules' => TaxRule::all()
        ]);
    }
    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rate_percentage' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);
        TaxRule::create($validated);
        return redirect()->back();
    }
}
