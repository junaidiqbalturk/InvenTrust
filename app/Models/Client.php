<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function invoices() { return $this->hasMany(Invoice::class); }
    public function ledgerEntries() { return $this->hasMany(LedgerEntry::class); }
}
