<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Client;
use App\Models\LedgerEntry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PaymentApiController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Payment::with('client')->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:inbound,outbound',
            'method' => 'required|string',
            'reference' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $payment = Payment::create($validated);
            
            // Generate ledger entry
            LedgerEntry::create([
                'client_id' => $validated['client_id'],
                'type' => $validated['type'] === 'inbound' ? 'credit' : 'debit',
                'amount' => $validated['amount'],
                'balance' => 0, // In a real app, calculate actual balance
                'description' => "Payment #{$payment->id} ({$validated['method']})",
                'reference_type' => Payment::class,
                'reference_id' => $payment->id,
            ]);

            return response()->json($payment, 201);
        });
    }
}
