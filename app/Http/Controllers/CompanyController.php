<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    public function show()
    {
        return response()->json(auth()->user()->company);
    }

    public function update(Request $request)
    {
        $company = auth()->user()->company;
        
        $validated = $request->validate([
            'company_name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'currency' => 'sometimes|required|string|max:3',
            'settings' => 'nullable|array',
        ]);

        $company->update($validated);

        return response()->json($company);
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $company = auth()->user()->company;

        if ($request->hasFile('logo')) {
            if ($company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
            }

            $path = $request->file('logo')->store('logos', 'public');
            $company->update(['logo_path' => $path]);

            return response()->json([
                'message' => 'Logo uploaded successfully',
                'path' => $path,
                'url' => asset('storage/' . $path)
            ]);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }
}
