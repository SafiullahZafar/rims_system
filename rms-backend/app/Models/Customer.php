<?php

namespace App\Models;

use App\Models\Concerns\BelongsToBusiness;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use BelongsToBusiness;

    protected $fillable = ['business_id', 'name', 'phone', 'email', 'notes'];
}
