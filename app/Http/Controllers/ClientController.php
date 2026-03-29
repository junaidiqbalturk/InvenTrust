<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index()
    {
        return Inertia::render('Clients/Index', [
            'clients' => Client::all()
        ]);
    }

    public function show(Client $client)
    {
        $ledgerEntries = $client->ledgerEntries()
            ->with('reference') // Reference can be Invoice, Payment, etc.
            ->orderBy('date', 'desc')
            ->get();

        // Calculate running balance if needed, but we store it in the client and ledger
        // For better historical accuracy, we can compute it if not stored in each entry.
        // Current implementation uses the client's balance as the "latest".

        return Inertia::render('Clients/Show', [
            'client' => $client,
            'ledgerEntries' => $ledgerEntries->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'date' => $entry->created_at->toDateString(),
                    'description' => $entry->description,
                    'debit' => $entry->type === 'debit' ? $entry->amount : 0,
                    'credit' => $entry->type === 'credit' ? $entry->amount : 0,
                    'balance' => $entry->balance_after_transaction ?? 0, // Placeholder if we add this col
                    'reference' => 'REF-' . $entry->id
                ];
            })
        ]);
    }
}
