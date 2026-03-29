<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    use HasFactory, \App\Traits\Multitenant;

    protected $fillable = [
        'name',
        'location',
        'company_id',
        'is_active',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'warehouse_product')
                    ->withPivot('stock_quantity')
                    ->withTimestamps();
    }
}
