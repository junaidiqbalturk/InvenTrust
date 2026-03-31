<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankRule extends Model
{
    use \App\Traits\Multitenant;

    protected $fillable = [
        'company_id',
        'name',
        'pattern',
        'account_id',
        'is_active',
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}
