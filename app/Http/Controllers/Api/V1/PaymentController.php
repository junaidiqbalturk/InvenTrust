<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Party;
use App\Services\AccountingService;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $payments = Payment::with('party')->latest()->get();
        return $this->successResponse($payments, 'Payments retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'party_id' => 'required|exists:parties,id',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|string',
            'type' => 'required|in:incoming,outgoing',
            'reference' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation Error', 422, $validator->errors());
        }

        return DB::transaction(function () use ($request) {
            $payment = Payment::create($request->all());

            $amount = (float)$request->amount;
            $description = ucfirst($request->type) . ' Payment: ' . $request->input('method') . ($request->reference ? ' (' . $request->reference . ')' : '');


            if ($request->type === 'incoming') {
                // Customer paying us: Debit Cash, Credit Accounts Receivable
                $entries = [
                    [
                        'account_code' => '1001', // Cash
                        'debit' => $amount,
                        'credit' => 0,
                        'party_id' => null,
                    ],
                    [
                        'account_code' => '1200', // Accounts Receivable
                        'debit' => 0,
                        'credit' => $amount,
                        'party_id' => $request->party_id,
                    ]
                ];
            } else {
                // Paying supplier: Debit Accounts Payable, Credit Cash
                $entries = [
                    [
                        'account_code' => '2100', // Accounts Payable
                        'debit' => $amount,
                        'credit' => 0,
                        'party_id' => $request->party_id,
                    ],
                    [
                        'account_code' => '1001', // Cash
                        'debit' => 0,
                        'credit' => $amount,
                        'party_id' => null,
                    ]
                ];
            }

            AccountingService::postTransaction(
                $description,
                $request->date,
                $entries,
                $payment
            );

            return $this->successResponse($payment->load('party'), 'Payment recorded and posted to ledger successfully', 201);
        });
    }


    public function show(Payment $payment)
    {
        return $this->successResponse($payment->load('party'), 'Payment retrieved successfully');
    }
}
