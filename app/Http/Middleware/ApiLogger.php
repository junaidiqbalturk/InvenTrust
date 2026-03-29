<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;

class ApiLogger
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Logging only API requests
        if ($request->is('api/*')) {
            $logFile = storage_path('logs/api_requests.json');

            $logData = [
                'time' => now()->toDateTimeString(),
                'method' => $request->method(),
                'url' => $request->fullUrl(),
                'request_headers' => $request->headers->all(),
                'request_body' => $request->all(),
                'response_status' => $response->status(),
                'response_body' => json_decode($response->getContent(), true) ?: $response->getContent(),
            ];

            // Maintain a JSON array of logs
            $logs = [];
            if (File::exists($logFile)) {
                $content = File::get($logFile);
                $logs = json_decode($content, true) ?: [];
            }

            $logs[] = $logData;

            // Keep only the last 100 requests to avoid huge file
            if (count($logs) > 100) {
                array_shift($logs);
            }

            File::put($logFile, json_encode($logs, JSON_PRETTY_PRINT));
        }

        return $response;
    }
}
