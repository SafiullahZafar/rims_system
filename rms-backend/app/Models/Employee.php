<?php

namespace App\Models;

use App\Models\Concerns\BelongsToBusiness;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Employee extends Authenticatable
{
    use BelongsToBusiness, HasApiTokens, Notifiable;
    protected $fillable = [
        'business_id',
        'name',
        'username',
        'email',
        'phone',
        'role_id',
        'pin',
        'password',
        'is_active',
        'extra_permissions',
        'is_super_admin',
        'is_demo_user',
    ];

    protected $hidden = [
        'password',
        'pin',
    ];

    protected function casts(): array
    {
        return [
            'is_active'         => 'boolean',
            'extra_permissions' => 'array',
            'is_super_admin'    => 'boolean',
            'is_demo_user'      => 'boolean',
            'password'          => 'hashed',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}
