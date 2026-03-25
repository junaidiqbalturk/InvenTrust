<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaxRule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TaxRuleApiController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(TaxRule::all());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rate_percentage' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $taxRule = TaxRule::create($validated);

        return response()->json($taxRule, 201);
    }
}
