<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DemoActivityLog extends Model
{
    protected $fillable = ['demo_visitor_id', 'method', 'path', 'ip_address'];

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(DemoVisitor::class, 'demo_visitor_id');
    }
}
