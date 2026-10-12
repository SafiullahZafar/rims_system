<?php

namespace App\Models;

use App\Models\Concerns\BelongsToBusiness;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use BelongsToBusiness;

    protected $fillable = [
        'business_id',
        'title',
        'amount',
        'category',
        'date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'date'   => 'date',
        ];
    }
}
