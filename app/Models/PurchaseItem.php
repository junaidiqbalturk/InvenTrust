<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseItem extends Model
{
    use HasFactory, \App\Traits\Multitenant;
    
    protected $fillable = [
        'company_id',
        'purchase_id',
        'product_id',
        'quantity',
        'unit_price',
        'subtotal',
    ];

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
