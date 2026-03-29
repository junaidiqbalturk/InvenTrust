<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Party extends Model
{
    use HasFactory, \App\Traits\Multitenant;
    
    protected $fillable = [
        'company_id',
        'name',
        'type',
        'phone',
        'email',
        'address',
        'opening_balance',
        'current_balance',
    ];

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }

    public function ledgerEntries()
    {
        return $this->hasMany(LedgerEntry::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Update current balance based on ledger entries or direct transactions.
     */
    public function updateBalance()
    {
        // For Parties (AR/AP):
        // Debits increase the balance (increase what is owed to us).
        // Credits decrease the balance (decrease what is owed to us).
        $this->current_balance = $this->opening_balance + $this->ledgerEntries()->sum('debit') - $this->ledgerEntries()->sum('credit');
        $this->save();
    }

}
