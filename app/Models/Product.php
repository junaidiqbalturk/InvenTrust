<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function taxRule() { return $this->belongsTo(TaxRule::class); }
    public function stockMovements() { return $this->hasMany(StockMovement::class); }
}
