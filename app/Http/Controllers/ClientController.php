<?php
namespace App\Http\Controllers;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index() {
        return Inertia::render('Clients/Index', [
            'clients' => Client::all()
        ]);
    }
    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:vendor,customer',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);
        Client::create($validated);
        return redirect()->back();
    }
    public function show(Client $client) {
        $client->load('ledgerEntries.invoice', 'invoices');
        return Inertia::render('Clients/Show', [
            'client' => $client
        ]);
    }
}
