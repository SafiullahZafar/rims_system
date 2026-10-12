<?php

namespace App\Models;

use App\Models\Concerns\BelongsToBusiness;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use BelongsToBusiness;

    protected $fillable = [
        'business_id',
        'name',
        'category',
        'price',
        'emoji',
        'prep_time',
        'popular',
        'description',
        'image',
        'discount',
        'is_available',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'popular' => 'boolean',
            'is_available' => 'boolean',
        ];
    }
}
