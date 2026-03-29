<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JournalTransaction extends Model
{
    protected $fillable = [
        'date',
        'description',
        'referenceable_id',
        'referenceable_type',
        'company_id',
        'created_by'
    ];

    public function ledgerEntries()
    {
        return $this->hasMany(LedgerEntry::class, 'transaction_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function referenceable()
    {
        return $this->morphTo();
    }
}

