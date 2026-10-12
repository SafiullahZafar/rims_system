<?php

namespace App\Models;

use App\Models\Concerns\BelongsToBusiness;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplyLog extends Model
{
    use BelongsToBusiness;

    protected $fillable = [
        'business_id',
        'supply_id', 'type', 'quantity', 'unit_cost', 'date', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity'  => 'decimal:2',
            'unit_cost' => 'decimal:2',
            'date'      => 'date',
        ];
    }

    public function supply(): BelongsTo
    {
        return $this->belongsTo(Supply::class);
    }
}
