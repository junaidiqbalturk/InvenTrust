<?php

namespace App\Traits;

use App\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

trait Multitenant
{
    public static function bootMultitenant()
    {
        static::creating(function (Model $model) {
            if (app()->runningInConsole() && !app()->runningUnitTests()) {
                return;
            }

            $user = auth()->user();
            if ($user && $user->company_id && !$model->company_id) {
                $model->company_id = $user->company_id;
            }

            if ($user && !$model->created_by_id && Schema::hasColumn($model->getTable(), 'created_by_id')) {
                $model->created_by_id = $user->id;
            }
        });

        static::addGlobalScope(new \App\Scopes\TenantScope);
    }

    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by_id');
    }
}
