<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Product;
use App\Models\Party;
use App\Services\AccountingService;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;


class PurchaseController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $purchases = Purchase::with('party')->latest()->get();
        return $this->successResponse($purchases, 'Purchases retrieved successfully');
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

            $paid_amount = $request->paid_amount ?? 0;
            $due_amount = $total_amount - $paid_amount;

            $status = 'unpaid';
            if ($due_amount <= 0) $status = 'paid';
            elseif ($paid_amount > 0) $status = 'partial';

            $purchase = Purchase::create([
                'purchase_no' => 'PUR-' . time(),
                'party_id' => $request->party_id,
                'date' => $request->date,
                'total_amount' => $total_amount,
                'paid_amount' => $paid_amount,
                'due_amount' => $due_amount,
                'status' => $status,
            ]);

            foreach ($request->items as $itemData) {
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $itemData['product_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'subtotal' => $itemData['quantity'] * $itemData['unit_price'],
                ]);

                // Increment Stock
                $product = Product::find($itemData['product_id']);
                if ($product) {
                    $product->increment('stock_quantity', $itemData['quantity']);
                }
            }

            // 1. Post Purchase Transaction
            $purchaseEntries = [
                [
                    'account_code' => '1300', // Inventory
                    'debit' => $total_amount,
                    'credit' => 0,
                    'party_id' => null,
                ],
                [
                    'account_code' => '2100', // Accounts Payable
                    'debit' => 0,
                    'credit' => $total_amount,
                    'party_id' => $request->party_id,
                ]
            ];

            AccountingService::postTransaction(
                "Purchase Invoice: {$purchase->purchase_no}",
                $request->date,
                $purchaseEntries,
                $purchase
            );

            // 2. Post Payment Transaction (if any)
            if ($paid_amount > 0) {
                $paymentEntries = [
                    [
                        'account_code' => '2100', // Accounts Payable
                        'debit' => $paid_amount,
                        'credit' => 0,
                        'party_id' => $request->party_id,
                    ],
                    [
                        'account_code' => '1001', // Cash
                        'debit' => 0,
                        'credit' => $paid_amount,
                        'party_id' => null,
                    ]
                ];

                AccountingService::postTransaction(
                    "Payment made for Purchase: {$purchase->purchase_no}",
                    $request->date,
                    $paymentEntries,
                    $purchase
                );
            }

            return $this->successResponse($purchase->load('items.product', 'party'), 'Purchase recorded and posted to ledger successfully', 201);
        });

    }

    public function show(Purchase $purchase)
    {
        return $this->successResponse($purchase->load('items.product', 'party'), 'Purchase retrieved successfully');
    }

    public function pay(Request $request, Purchase $purchase)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01|max:' . ($purchase->due_amount + 0.01),
            'date' => 'required|date',
            'method' => 'required|in:cash,bank',
            'reference' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation Error', 422, $validator->errors());
        }

        return DB::transaction(function () use ($request, $purchase) {
            $payment = \App\Models\Payment::create([
                'party_id' => $purchase->party_id,
                'date' => $request->date,
                'amount' => $request->amount,
                'method' => $request->method,
                'type' => 'outgoing',
                'reference' => $request->reference ?? 'Settle payment for ' . $purchase->purchase_no,
            ]);

            $purchase->increment('paid_amount', $request->amount);
            $purchase->decrement('due_amount', $request->amount);
            
            $purchase->refresh();
            $purchase->status = ($purchase->due_amount <= 0) ? 'paid' : 'partial';
            $purchase->save();

            $methodAccount = $request->method === 'cash' ? '1001' : '1002';
            
            AccountingService::postTransaction(
                'Payment made for ' . $purchase->purchase_no,
                $request->date,
                [
                    // Debit Accounts Payable (Liability decreases)
                    ['account_code' => '2100', 'debit' => $request->amount, 'party_id' => $purchase->party_id],
                    // Credit Cash/Bank (Asset decreases)
                    ['account_code' => $methodAccount, 'credit' => $request->amount]
                ],
                $payment
            );

            return $this->successResponse($purchase->load(['party', 'ledgerEntries']), 'Payment recorded and posted to ledger successfully');
        });
    }
}
