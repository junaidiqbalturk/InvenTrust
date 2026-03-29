<?php

namespace App\Services;

use App\Models\ExchangeRate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ExchangeRateService
{
    protected $baseUrl = 'https://open.er-api.com/v6/latest/';

    public function getRate($from, $to, $date = null, $force = false)
    {
        $date = $date ? Carbon::parse($date)->toDateString() : Carbon::today()->toDateString();

        if (!$force) {
            $cached = ExchangeRate::where('from_currency', $from)
                ->where('to_currency', $to)
                ->where('date', $date)
                ->first();

            if ($cached) {
                return $cached->rate;
            }
        }

        try {
            $response = Http::timeout(5)->get($this->baseUrl . $from);
            if ($response->successful()) {
                $rates = $response->json()['rates'];
                if (isset($rates[$to])) {
                    $rate = $rates[$to];
                    
                    ExchangeRate::updateOrCreate(
                        ['from_currency' => $from, 'to_currency' => $to, 'date' => $date],
                        ['rate' => $rate]
                    );
                    
                    return $rate;
                }
            }
        } catch (\Exception $e) {
            Log::error("Exchange Rate API failure: " . $e->getMessage());
        }

        if ($from === $to) return 1.0;
        if ($from === 'USD' && $to === 'PKR') return 280.00;
        if ($from === 'PKR' && $to === 'USD') return 0.00357;

        return 1.0;
    }

    public function convert($amount, $from, $to, $date = null)
    {
        if ($from === $to) return $amount;
        $rate = $this->getRate($from, $to, $date);
        return $amount * $rate;
    }
}
