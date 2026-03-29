<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    use HasFactory, \App\Traits\Multitenant;

    protected $fillable = [
        'name',
        'code',
        'type',
        'company_id',
    ];

    public function ledgerEntries()
    {
        return $this->hasMany(LedgerEntry::class);
    }

    /**
     * Get the balance of the account.
     */
    public function getBalance()
    {
        $debits = $this->ledgerEntries()->sum('debit');
        $credits = $this->ledgerEntries()->sum('credit');

        // Assets and Expenses have debit balances
        if (in_array($this->type, ['asset', 'expense'])) {
            return $debits - $credits;
        }

        // Liabilities, Equity, and Income have credit balances
        return $credits - $debits;
    }
}
