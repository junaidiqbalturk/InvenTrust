<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use HasFactory, \App\Traits\Multitenant;
    
    protected $fillable = [
        'company_id',
        'purchase_no',
        'party_id',
        'date',
        'total_amount',
        'paid_amount',
        'due_amount',
        'status',
    ];

    public function party()
    {
        return $this->belongsTo(Party::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function ledgerEntries()
    {
        return $this->morphMany(LedgerEntry::class, 'referenceable');
    }
}
