<?php
namespace App\Http\Controllers;
use App\Models\Product;
use App\Models\TaxRule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index() {
        return Inertia::render('Products/Index', [
            'products' => Product::with('taxRule')->get(),
            'taxRules' => TaxRule::all(),
        ]);
    }
    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|unique:products,sku',
            'price' => 'required|numeric|min:0',
            'tax_rule_id' => 'nullable|exists:tax_rules,id',
        ]);
        Product::create($validated);
        return redirect()->back();
    }
}
