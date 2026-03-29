<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LedgerEntry extends Model
{
    use HasFactory, \App\Traits\Multitenant;
    
    protected $fillable = [
        'company_id',
        'account_id',
        'transaction_id',
        'party_id',
        'date',
        'debit',
        'credit',
        'amount',
        'running_balance',
        'referenceable_id',
        'referenceable_type',
        'description',
    ];


    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function party()
    {
        return $this->belongsTo(Party::class);
    }

    public function referenceable()
    {
        return $this->morphTo();
    }
}
