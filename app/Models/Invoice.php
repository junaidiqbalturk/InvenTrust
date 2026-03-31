<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory, \App\Traits\Multitenant;
    
    protected $fillable = [
        'company_id',
        'invoice_no',
        'party_id',
        'date',
        'total_amount',
        'discount',
        'tax',
        'final_amount',
        'paid_amount',
        'due_amount',
        'status',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function party()
    {
        return $this->belongsTo(Party::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function ledgerEntries()
    {
        return $this->morphMany(LedgerEntry::class, 'referenceable');
    }
}
