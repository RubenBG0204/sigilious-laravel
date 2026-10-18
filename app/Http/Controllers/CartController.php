<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function show(Request $request)
    {
        $cart = Cart::where('user_id', $request->user()->id)->first();

        return response()->json(['items' => $cart?->items ?? []]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'items' => ['present', 'array'],
            'items.*.id' => ['required'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:20'],
            'items.*.size' => ['nullable', 'string', 'max:10'],
        ]);

        Cart::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['items' => $data['items']]
        );

        return response()->json(['items' => $data['items']]);
    }
}