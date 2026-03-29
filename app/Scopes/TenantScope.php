<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model)
    {
        if (app()->runningInConsole() && !app()->runningUnitTests()) {
            return;
        }

        // Use auth()->user() which is more reliable across guards
        $user = auth()->user();

        if ($user) {
            // If the user has a company_id, scope the query to that company
            if ($user->company_id) {
                $builder->where($model->getTable() . '.company_id', $user->company_id);
            } else {
                // If the user is logged in but has NO company_id (e.g. Super Admin),
                // they should see users with company_id = null.
                // However, they might still mistakenly see others if company_id is not properly set.
                // For now, we scope to NULL to prevent seeing everything.
                $builder->whereNull($model->getTable() . '.company_id');
            }
        }
    }
}
