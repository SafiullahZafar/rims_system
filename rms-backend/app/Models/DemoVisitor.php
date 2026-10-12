<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class DemoVisitor extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = ['business_id', 'name', 'ip_address'];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(DemoActivityLog::class);
    }
}
