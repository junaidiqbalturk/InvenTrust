<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LedgerEntry;
use App\Models\Party;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class LedgerController extends Controller
{
    use ApiResponse;

    public function show($partyId)
    {
        $party = Party::findOrFail($partyId);
        $entries = LedgerEntry::where('party_id', $partyId)
            ->with('referenceable')
            ->orderBy('date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return $this->successResponse([
            'party' => $party,
            'entries' => $entries
        ], 'Ledger retrieved successfully');
    }
}
