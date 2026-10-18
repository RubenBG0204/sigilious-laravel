<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index()
    {
        return Product::orderBy('id')->get();
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['sizes'] ??= ['S', 'M', 'L', 'XL'];

        return response()->json(Product::create($data), 201);
    }

    public function update(Request $request, Product $product)
    {
        $product->update($this->validated($request));

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->noContent();
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'category' => ['required', Rule::in(['tshirts', 'hoodies', 'pants', 'accessories', 'shoes'])],
            'price' => ['required', 'numeric', 'min:0'],
            'image' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:1000'],
            'sizes' => ['nullable', 'array', 'min:1'],
            'sizes.*' => ['string', 'max:10'],
        ]);
    }
}