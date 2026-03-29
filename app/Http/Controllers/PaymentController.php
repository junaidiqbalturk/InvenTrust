<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Party;
use App\Models\LedgerEntry;
use App\Services\AccountingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index()
    {
        return Payment::with('party')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'party_id' => 'required|exists:parties,id',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|string', // cash, bank, etc.
            'type' => 'required|in:incoming,outgoing',
            'reference' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $payment = Payment::create($validated);

            if ($validated['type'] === 'incoming') {
                // Customer pays us (Debit Cash, Credit AR)
                $entries = [
                    ['account_code' => '1001', 'debit' => $validated['amount']],
                    ['account_code' => '1200', 'credit' => $validated['amount'], 'party_id' => $validated['party_id']]
                ];
            } else {
                // We pay supplier (Debit AP, Credit Cash)
                $entries = [
                    ['account_code' => '2100', 'debit' => $validated['amount'], 'party_id' => $validated['party_id']],
                    ['account_code' => '1001', 'credit' => $validated['amount']]
                ];
            }

            AccountingService::postTransaction(
                'Payment (' . $validated['method'] . ') - ' . ($validated['reference'] ?? 'No ref'),
                $validated['date'],
                $entries,
                $payment
            );

            return $payment->load('party');
        });
    }

    public function show(Payment $payment)
    {
        return $payment->load('party');
    }

    public function destroy(Payment $payment)
    {
        return DB::transaction(function () use ($payment) {
            if ($payment->type === 'incoming') {
                // Reverse: Add back to AR debt
                $payment->party->increment('current_balance', $payment->amount);
            } else {
                // Reverse: Add back to AP debt
                $payment->party->decrement('current_balance', $payment->amount);
            }

            $payment->delete();
            return response()->noContent();
        });
    }
}
