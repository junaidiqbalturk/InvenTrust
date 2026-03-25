<?php
namespace App\Http\Controllers;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockMovementController extends Controller
{
    public function index() {
        return Inertia::render('Inventory/Movements', [
            'movements' => StockMovement::with('product')->latest()->paginate(50)
        ]);
    }
}
