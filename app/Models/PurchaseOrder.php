<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = ['supplier_id', 'status', 'total', 'date', 'notes'];

    public function supplier()
    {
        return $this->belongsTo(Client::class, 'supplier_id');
    }
}
