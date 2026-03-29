<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use App\Models\Party;
use App\Services\AccountingService;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;


class InvoiceController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $invoices = Invoice::with('party')->latest()->get();
        return $this->successResponse($invoices, 'Invoices retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'party_id' => 'required|exists:parties,id',
            'date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric',
            'discount' => 'nullable|numeric',
            'tax' => 'nullable|numeric',
            'paid_amount' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation Error', 422, $validator->errors());
        }

        return DB::transaction(function () use ($request) {
            $total_amount = 0;
            foreach ($request->items as $item) {
                $total_amount += $item['quantity'] * $item['unit_price'];
            }

            $discount = $request->discount ?? 0;
            $tax = $request->tax ?? 0;
            $final_amount = $total_amount - $discount + $tax;
            $paid_amount = $request->paid_amount ?? 0;
            $due_amount = $final_amount - $paid_amount;

            $status = 'unpaid';
            if ($due_amount <= 0) $status = 'paid';
            elseif ($paid_amount > 0) $status = 'partial';

            $invoice = Invoice::create([
                'invoice_no' => 'INV-' . time(),
                'party_id' => $request->party_id,
                'date' => $request->date,
                'total_amount' => $total_amount,
                'discount' => $discount,
                'tax' => $tax,
                'final_amount' => $final_amount,
                'paid_amount' => $paid_amount,
                'due_amount' => $due_amount,
                'status' => $status,
            ]);

            foreach ($request->items as $itemData) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $itemData['product_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'subtotal' => $itemData['quantity'] * $itemData['unit_price'],
                ]);

                // Decrement Stock
                $product = Product::find($itemData['product_id']);
                if ($product) {
                    $product->decrement('stock_quantity', $itemData['quantity']);
                }
            }

            // 1. Post Invoice Transaction
            $invoiceEntries = [
                [
                    'account_code' => '1200', // Accounts Receivable
                    'debit' => $final_amount,
                    'credit' => 0,
                    'party_id' => $request->party_id,
                ],
                [
                    'account_code' => '4000', // Sales Revenue
                    'debit' => 0,
                    'credit' => $final_amount, // For simplicity, putting total in revenue (can split tax if account exists)
                    'party_id' => null,
                ]
            ];

            AccountingService::postTransaction(
                "Sales Invoice: {$invoice->invoice_no}",
                $request->date,
                $invoiceEntries,
                $invoice
            );

            // 2. Post Payment Transaction (if any)
            if ($paid_amount > 0) {
                $paymentEntries = [
                    [
                        'account_code' => '1001', // Cash
                        'debit' => $paid_amount,
                        'credit' => 0,
                        'party_id' => null,
                    ],
                    [
                        'account_code' => '1200', // Accounts Receivable
                        'debit' => 0,
                        'credit' => $paid_amount,
                        'party_id' => $request->party_id,
                    ]
                ];

                AccountingService::postTransaction(
                    "Payment received for Invoice: {$invoice->invoice_no}",
                    $request->date,
                    $paymentEntries,
                    $invoice
                );
            }

            return $this->successResponse($invoice->load('items.product', 'party'), 'Invoice created and posted to ledger successfully', 201);
        });

    }

    public function show(Invoice $invoice)
    {
        return $this->successResponse($invoice->load('items.product', 'party'), 'Invoice retrieved successfully');
    }
}
