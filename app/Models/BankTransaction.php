<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankTransaction extends Model
{
    use \App\Traits\Multitenant;

    protected $fillable = [
        'company_id',
        'bank_statement_id',
        'date',
        'description',
        'amount',
        'type',
        'is_reconciled',
        'ledger_entry_id',
    ];

    public function bankStatement()
    {
        return $this->belongsTo(BankStatement::class);
    }

    public function ledgerEntry()
    {
        return $this->belongsTo(LedgerEntry::class);
    }
}
