<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory, \App\Traits\Multitenant;
    
    protected $fillable = [
        'company_id',
        'name',
        'sku',
        'category',
        'unit',
        'purchase_price',
        'sale_price',
        'stock_quantity',
        'low_stock_threshold',
    ];

    public function invoiceItems()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function purchaseItems()
    {
        return $this->hasMany(PurchaseItem::class);
    }
}
