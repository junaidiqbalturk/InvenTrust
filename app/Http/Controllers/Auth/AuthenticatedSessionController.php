<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        \Illuminate\Support\Facades\Log::info('Login Attempt', [
            'email' => $request->email,
            'ip' => $request->ip(),
            'headers' => $request->headers->all(),
        ]);

        try {
            $request->authenticate();
            \Illuminate\Support\Facades\Log::info('Login Success', ['email' => $request->email]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Login Failed', [
                'email' => $request->email,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }

        $request->session()->regenerate();

        if ($request->wantsJson() || $request->header('X-SPA-REQUEST')) {
            return response()->json($request->user());
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
