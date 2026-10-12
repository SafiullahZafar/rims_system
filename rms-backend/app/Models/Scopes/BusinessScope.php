<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use App\Support\BusinessContext;

class BusinessScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $businessId = BusinessContext::id();

        if ($businessId) {
            $builder->where($model->qualifyColumn('business_id'), $businessId);
            return;
        }

        // No authenticated business context must never expose tenant records.
        $builder->whereRaw('1 = 0');
    }
}
