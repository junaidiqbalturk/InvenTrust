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
        'parent_id',
        'description',
        'is_system',
        'company_id',
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    public function ledgerEntries()
    {
        return $this->hasMany(LedgerEntry::class);
    }

    public function children()
    {
        return $this->hasMany(Account::class, 'parent_id');
    }

    public function allChildren()
    {
        return $this->children()->with('allChildren');
    }

    public function parent()
    {
        return $this->belongsTo(Account::class, 'parent_id');
    }

    public function scopeIsRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeIsSystem($query)
    {
        return $query->where('is_system', true);
    }

    /**
     * Get the balance of the account, optionally including children.
     */
    public function getBalance($includeChildren = true)
    {
        $debits = $this->ledgerEntries()->sum('debit');
        $credits = $this->ledgerEntries()->sum('credit');

        $selfBalance = in_array($this->type, ['asset', 'expense']) 
            ? $debits - $credits 
            : $credits - $debits;

        if ($includeChildren && $this->children()->exists()) {
            foreach ($this->children as $child) {
                $selfBalance += $child->getBalance(true);
            }
        }

        return $selfBalance;
    }
}
