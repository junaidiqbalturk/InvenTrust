<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;

class StockMovementApiController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(StockMovement::with('product')->latest()->paginate(50));
    }
}
