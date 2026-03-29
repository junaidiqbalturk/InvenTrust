<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory, \App\Traits\Multitenant;
    
    protected $fillable = [
        'company_id',
        'party_id',
        'date',
        'amount',
        'method',
        'type',
        'reference',
    ];

    public function party()
    {
        return $this->belongsTo(Party::class);
    }

    public function ledgerEntries()
    {
        return $this->morphMany(LedgerEntry::class, 'referenceable');
    }
}
