<?php

namespace App\Models\Concerns;

use App\Models\Business;
use App\Models\Employee;
use App\Models\Scopes\BusinessScope;
use App\Support\BusinessContext;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

trait BelongsToBusiness
{
    protected static function bootBelongsToBusiness(): void
    {
        static::creating(function ($model): void {
            if ($model->business_id !== null || ($model instanceof \App\Models\Employee && $model->is_super_admin)) {
                return;
            }

            $businessId = BusinessContext::id();

            if (! $businessId) {
                throw new LogicException('A business context is required to create this record.');
            }

            $model->business_id = $businessId;
        });

        if (static::class !== Employee::class) {
            static::addGlobalScope(new BusinessScope());
        }
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}
