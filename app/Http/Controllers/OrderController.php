<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        return Order::where('user_id', $request->user()->id)
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.size' => ['required', 'string', 'max:10'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:20'],
        ]);

        $products = Product::whereIn('id', collect($data['items'])->pluck('product_id'))
            ->get()
            ->keyBy('id');

        $items = [];
        $total = 0;

        foreach ($data['items'] as $line) {
            $product = $products[$line['product_id']];
            $lineTotal = $product->price * $line['qty'];
            $total += $lineTotal;

            $items[] = [
                'product_id' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->price,
                'size' => $line['size'],
                'qty' => $line['qty'],
                'line_total' => $lineTotal,
            ];
        }

        $order = Order::create([
            'user_id' => $request->user('sanctum')?->id,
            'customer_name' => $data['name'],
            'items' => $items,
            'total' => $total,
        ]);

        return response()->json($order, 201);
    }
}