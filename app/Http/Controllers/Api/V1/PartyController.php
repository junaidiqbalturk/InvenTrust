<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Party;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Validator;

class PartyController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $type = $request->query('type');
        $parties = Party::when($type, function($query) use ($type) {
            return $query->where('type', $type);
        })->get();

        return $this->successResponse($parties, 'Parties retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'type' => 'required|in:customer,supplier',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'opening_balance' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation Error', 422, $validator->errors());
        }

        $party = Party::create($validator->validated());
        $party->current_balance = $party->opening_balance;
        $party->save();

        return $this->successResponse($party, 'Party created successfully', 201);
    }

    public function show(Party $party)
    {
        return $this->successResponse($party, 'Party retrieved successfully');
    }

    public function update(Request $request, Party $party)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'string',
            'type' => 'in:customer,supplier',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'opening_balance' => 'numeric',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation Error', 422, $validator->errors());
        }

        $party->update($validator->validated());
        $party->updateBalance();

        return $this->successResponse($party, 'Party updated successfully');
    }

    public function destroy(Party $party)
    {
        $party->delete();
        return $this->successResponse(null, 'Party deleted successfully');
    }
}
