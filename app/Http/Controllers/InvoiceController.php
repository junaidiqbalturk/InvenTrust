<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Client;
use App\Models\Product;
use App\Services\InvoiceService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    protected $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    public function index() {
        return Inertia::render('Invoices/Index', [
            'invoices' => Invoice::with('client')->latest()->get()
        ]);
    }

    public function create() {
        return Inertia::render('Invoices/Create', [
            'clients' => Client::all(),
            'products' => Product::with('taxRule')->get(),
        ]);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'type' => 'required|in:sale,purchase',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_amount' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'tax_amount' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
        ]);

        $this->invoiceService->createInvoice($validated);

        return redirect()->route('invoices.index');
    }
}
