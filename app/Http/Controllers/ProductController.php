<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index()
    {
        return Product::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'sku' => 'required|string|unique:products',
            'category' => 'nullable|string',
            'unit' => 'nullable|string',
            'purchase_price' => 'nullable|numeric',
            'sale_price' => 'nullable|numeric',
            'stock_quantity' => 'nullable|integer',
            'low_stock_threshold' => 'nullable|integer',
        ]);

        return DB::transaction(function () use ($validated) {
            $initialStock = $validated['stock_quantity'] ?? 0;
            unset($validated['stock_quantity']); 

            if (!isset($validated['company_id'])) {
                $validated['company_id'] = auth()->user()->company_id;
            }

            $product = Product::create($validated);
            
            if ($initialStock > 0) {
                // We reset to 0 just in case there's a default, though usually not
                $product->stock_quantity = 0;
                StockService::recordAdjustment($product, $initialStock, 'Initial stock on creation');
            }
            
            return $product;
        });
    }

    public function show(Product $product)
    {
        return $product;
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'sku' => 'sometimes|string|unique:products,sku,' . $product->id,
            'category' => 'nullable|string',
            'unit' => 'nullable|string',
            'purchase_price' => 'nullable|numeric',
            'sale_price' => 'nullable|numeric',
            'stock_quantity' => 'nullable|integer',
            'low_stock_threshold' => 'nullable|integer',
        ]);

        return DB::transaction(function () use ($validated, $product) {
            $newStock = $validated['stock_quantity'] ?? null;
            if (isset($validated['stock_quantity'])) {
                unset($validated['stock_quantity']); // Handle stock separately
            }

            $product->update($validated);
            
            if ($newStock !== null && $newStock != $product->stock_quantity) {
                $diff = $newStock - $product->stock_quantity;
                StockService::recordAdjustment($product, $diff, 'Manual stock adjustment via update');
            }
            
            return $product->fresh(); // Return updated model
        });
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->noContent();
    }

    /**
     * Get products with low stock.
     */
    public function lowStock()
    {
        return Product::whereColumn('stock_quantity', '<=', 'low_stock_threshold')->get();
    }
}
