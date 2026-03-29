<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Party;
use App\Models\Invoice;
use App\Models\Purchase;
use App\Models\LedgerEntry;
use App\Services\AccountingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class PaymentController extends Controller
{
    public function index()
    {
        return Payment::with(['party', 'invoice', 'purchase'])->latest()->get();
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'party_id' => 'required|exists:parties,id',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|string|in:cash,bank',
            'type' => 'required|in:incoming,outgoing',
            'reference' => 'nullable|string',
            'invoice_id' => 'nullable|exists:invoices,id',
            'purchase_id' => 'nullable|exists:purchases,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $payment = Payment::create($validated);

            if ($validated['type'] === 'incoming') {
                $methodAccount = $validated['method'] === 'cash' ? '1001' : '1002';
                $entries = [
                    ['account_code' => $methodAccount, 'debit' => $validated['amount']],
                    ['account_code' => '1200', 'credit' => $validated['amount'], 'party_id' => $validated['party_id']]
                ];
            } else {
                $methodAccount = $validated['method'] === 'cash' ? '1001' : '1002';
                $entries = [
                    ['account_code' => '2100', 'debit' => $validated['amount'], 'party_id' => $validated['party_id']],
                    ['account_code' => $methodAccount, 'credit' => $validated['amount']]
                ];
            }

            AccountingService::postTransaction(
                'Payment (' . $validated['method'] . ') - ' . ($validated['reference'] ?? 'No ref'),
                $validated['date'],
                $entries,
                $payment
            );

            if (!empty($validated['invoice_id'])) {
                $invoice = Invoice::find($validated['invoice_id']);
                $invoice->increment('paid_amount', $validated['amount']);
                $invoice->decrement('due_amount', $validated['amount']);
                $invoice->refresh();
                $invoice->status = ($invoice->due_amount <= 0) ? 'paid' : 'partial';
                $invoice->save();
            }

            if (!empty($validated['purchase_id'])) {
                $purchase = Purchase::find($validated['purchase_id']);
                $purchase->increment('paid_amount', $validated['amount']);
                $purchase->decrement('due_amount', $validated['amount']);
                $purchase->refresh();
                $purchase->status = ($purchase->due_amount <= 0) ? 'paid' : 'partial';
                $purchase->save();
            }

            return $payment->load('party');
        });
    }

    public function show(Payment $payment)
    {
        return $payment->load(['party', 'invoice', 'purchase', 'ledgerEntries']);
    }

    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'method' => 'required|string|in:cash,bank',
            'reference' => 'nullable|string',
        ]);

        $payment->update($validated);
        return $payment->load('party');
    }

    public function downloadReceipt(Payment $payment)
    {
        $payment->load(['party', 'invoice', 'purchase']);
        $pdf = Pdf::loadView('pdf.receipt', compact('payment'));
        
        return $pdf->download('Receipt-PAY-' . str_pad($payment->id, 6, '0', STR_PAD_LEFT) . '.pdf');
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
