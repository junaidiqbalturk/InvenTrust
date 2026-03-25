<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\TaxRule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductApiController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'products' => Product::with('taxRule')->get(),
            'taxRules' => TaxRule::all(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|unique:products,sku',
            'price' => 'required|numeric|min:0',
            'tax_rule_id' => 'nullable|exists:tax_rules,id',
        ]);

        $product = Product::create($validated);

        return response()->json($product, 201);
    }
}
