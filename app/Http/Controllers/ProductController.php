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
            $product = Product::create($validated);
            
            if ($product->stock_quantity > 0) {
                StockService::recordAdjustment($product, $product->stock_quantity, 'Initial stock on creation');
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
            $oldStock = $product->stock_quantity;
            $product->update($validated);
            
            if (isset($validated['stock_quantity']) && $validated['stock_quantity'] != $oldStock) {
                $diff = $validated['stock_quantity'] - $oldStock;
                StockService::recordAdjustment($product, $diff, 'Manual stock adjustment via update');
            }
            
            return $product;
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
