<?php

namespace App\Http\Controllers;

use App\Models\LedgerEntry;
use App\Models\Party;
use Illuminate\Http\Request;

class LedgerController extends Controller
{
    /**
     * Get ledger entries for a specific party.
     */
    public function show(Party $party)
    {
        return LedgerEntry::where('party_id', $party->id)
            ->latest()
            ->paginate(50);
    }

    /**
     * Get a consolidated ledger across all parties.
     */
    public function index()
    {
        return LedgerEntry::with('party')
            ->latest()
            ->paginate(100);
    }
}
