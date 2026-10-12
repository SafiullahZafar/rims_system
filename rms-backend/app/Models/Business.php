<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Business extends Model
{
    protected $fillable = ['name', 'slug', 'is_demo', 'is_active', 'module_permissions'];

    protected function casts(): array
    {
        return [
            'is_demo' => 'boolean',
            'is_active' => 'boolean',
            'module_permissions' => 'array',
        ];
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
