<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use HasFactory, \App\Traits\Multitenant;
    protected $fillable = [
        'company_id',
        'product_id',
        'warehouse_id',
        'type',
        'quantity',
        'new_stock',
        'referenceable_id',
        'referenceable_type',
        'description',
    ];

    public function product() 
    { 
        return $this->belongsTo(Product::class); 
    }

    public function warehouse() 
    { 
        return $this->belongsTo(Warehouse::class); 
    }

    public function referenceable() 
    { 
        return $this->morphTo(); 
    }
}
