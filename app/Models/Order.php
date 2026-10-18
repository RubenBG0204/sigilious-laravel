<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = ['user_id', 'customer_name', 'items', 'total'];

    protected $casts = [
        'items' => 'array',
    ];
}
