<?php

namespace App\Models;

use App\Models\Concerns\BelongsToBusiness;
use Illuminate\Database\Eloquent\Model;

class RestaurantTable extends Model
{
    use BelongsToBusiness;

    protected $fillable = [
        'business_id',
        'table_number',
        'seats',
        'section',
        'status',
        'current_order_code',
        'amount',
        'duration',
        'reserved_for',
        'guest_name',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }
}
