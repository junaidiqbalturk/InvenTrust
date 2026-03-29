<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\LedgerEntry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LedgerApiController extends Controller
{
    public function show($clientId): JsonResponse
    {
        $client = Client::findOrFail($clientId);
        $entries = LedgerEntry::where('client_id', $clientId)->latest()->get();
        return response()->json([
            'client' => $client,
            'entries' => $entries
        ]);
    }
}
