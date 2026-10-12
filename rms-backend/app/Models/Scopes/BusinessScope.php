<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class BusinessScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $businessId = Auth::user()?->business_id;

        if ($businessId) {
            $builder->where($model->qualifyColumn('business_id'), $businessId);
            return;
        }

        // No authenticated business context must never expose tenant records.
        $builder->whereRaw('1 = 0');
    }
}
