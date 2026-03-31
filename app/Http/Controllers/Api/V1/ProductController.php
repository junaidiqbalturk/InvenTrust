<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $products = Product::all();
        return $this->successResponse($products, 'Products retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'sku' => 'required|string|unique:products',
            'category' => 'nullable|string',
            'unit' => 'nullable|string',
            'purchase_price' => 'required|numeric',
            'sale_price' => 'required|numeric',
            'stock_quantity' => 'nullable|integer',
            'low_stock_threshold' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation Error', 422, $validator->errors());
        }

        $product = Product::create($validator->validated());

        // Record Initial Stock in Ledger if provided
        if ($product->stock_quantity > 0) {
            \App\Services\StockService::recordAdjustment(
                $product, 
                $product->stock_quantity, 
                "Initial stock on creation"
            );
        }

        return $this->successResponse($product, 'Product created successfully', 201);
    }

    public function show(Product $product)
    {
        return $this->successResponse($product, 'Product retrieved successfully');
    }

    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'string',
            'sku' => 'string|unique:products,sku,' . $product->id,
            'category' => 'nullable|string',
            'unit' => 'nullable|string',
            'purchase_price' => 'numeric',
            'sale_price' => 'numeric',
            'stock_quantity' => 'integer',
            'low_stock_threshold' => 'integer',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation Error', 422, $validator->errors());
        }

        $product->update($validator->validated());
        return $this->successResponse($product, 'Product updated successfully');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return $this->successResponse(null, 'Product deleted successfully');
    }
}
