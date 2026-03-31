<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function registerCompany(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'company_email' => 'required|string|email|max:255|unique:companies,email',
            'currency' => 'required|string|max:3',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'industry' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            // Enhanced Onboarding Fields
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'initial_balance' => 'nullable|numeric',
            'coa_type' => 'nullable|string|in:standard,minimal',
            'tax_id' => 'nullable|string|max:255',
            'fiscal_year_start' => 'nullable|string|max:20',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $company = Company::create([
                    'company_name' => $request->company_name,
                    'email' => $request->company_email,
                    'currency' => $request->currency,
                    'industry' => $request->industry,
                    'country' => $request->country,
                    'settings' => [
                        'enable_multi_warehouse' => true,
                        'tax_enabled' => $request->tax_id ? true : false,
                        'tax_id' => $request->tax_id,
                        'fiscal_year_start' => $request->fiscal_year_start ?: 'January',
                        'logo_url' => null,
                        'bank_info_provided' => $request->bank_name ? true : false,
                    ],
                ]);

                // Clone Permission Templates and get the workspace Admin role
                $roleService = new \App\Services\RoleService();
                $adminRole = $roleService->cloneTemplatesForCompany($company);

                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'company_id' => $company->id,
                    'role_id' => $adminRole->id,
                    'has_completed_onboarding' => 0,
                ]);

                // Initialize Financials & COA via Enhanced Seeder
                $demoService = new \App\Services\DemoDataService();
                $demoService->seed($company, [
                    'bank_name' => $request->bank_name,
                    'account_number' => $request->account_number,
                    'initial_balance' => $request->initial_balance,
                    'coa_type' => $request->coa_type ?: 'standard',
                ]);

                $user->load(['role.permissions', 'company']);

                return response()->json([
                    'user' => $user,
                    'company' => $company,
                    'token' => $user->createToken('auth_token')->plainTextToken
                ]);
            });
        } catch (\Exception $e) {
            \Log::error('Registration Failure: ' . $e->getMessage(), [
                'request' => $request->except(['password']),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Workspace Creation Failed: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user->load(['role.permissions', 'company']);

        return response()->json([
            'user' => $user,
            'company' => $user->company,
            'token' => $user->createToken('auth_token')->plainTextToken
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function completeOnboarding(Request $request)
    {
        $user = $request->user();
        $user->update(['has_completed_onboarding' => 1]);
        return response()->json([
            'message' => 'Onboarding status updated successfully',
            'user' => $user->load(['role.permissions', 'company'])
        ]);
    }
}
