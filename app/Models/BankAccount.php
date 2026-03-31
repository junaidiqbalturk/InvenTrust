<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    use HasFactory, \App\Traits\Multitenant;

    protected $fillable = [
        'bank_name',
        'account_number',
        'iban',
        'currency',
        'current_balance',
        'ledger_account_id',
        'company_id',
    ];

    /**
     * Get the ledger account associated with the bank.
     */
    public function ledgerAccount()
    {
        return $this->belongsTo(Account::class, 'ledger_account_id');
    }

    /**
     * The "booted" method of the model.
     * Ensure we always have a ledger account synced if missing (fallback).
     */
    protected static function booted()
    {
        static::deleting(function ($bankAccount) {
            // When a bank account is deleted, we might want to archive the ledger account 
            // instead of deleting it if it has transactions.
        });
    }
}
