<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankStatement extends Model
{
    use \App\Traits\Multitenant;

    protected $fillable = [
        'company_id',
        'account_id',
        'filename',
        'upload_date',
        'status',
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function transactions()
    {
        return $this->hasMany(BankTransaction::class);
    }
}
