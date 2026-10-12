<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Business extends Model
{
    protected $fillable = ['name', 'slug', 'is_demo', 'is_active', 'module_permissions', 'template_business_id', 'demo_data_initialized_at'];

    protected function casts(): array
    {
        return [
            'is_demo' => 'boolean',
            'is_active' => 'boolean',
            'module_permissions' => 'array',
            'demo_data_initialized_at' => 'datetime',
        ];
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    public function templateBusiness()
    {
        return $this->belongsTo(self::class, 'template_business_id');
    }
}
