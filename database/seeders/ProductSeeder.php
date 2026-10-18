<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['name' => 'Camiseta Costura Contour', 'price' => 42, 'category' => 'tshirts', 'image' => 'img-2', 'description' => 'Algodon transpirable con ajuste entallado.', 'sizes' => ['S', 'M', 'L', 'XL']],
            ['name' => 'Sudadera Airline Tech', 'price' => 98, 'category' => 'hoodies', 'image' => 'img-1', 'description' => 'Felpa suave con capucha estructurada.', 'sizes' => ['S', 'M', 'L', 'XL']],
            ['name' => 'Pantalon Studio Taper', 'price' => 76, 'category' => 'pants', 'image' => 'img-3', 'description' => 'Pierna entallada con elasticidad premium.', 'sizes' => ['S', 'M', 'L', 'XL']],
            ['name' => 'Gorra Aero', 'price' => 28, 'category' => 'accessories', 'image' => 'img-8', 'description' => 'Bordado minimalista, tejido ligero.', 'sizes' => ['M', 'L']],
            ['name' => 'Zapatilla Momentum', 'price' => 120, 'category' => 'shoes', 'image' => 'img-9', 'description' => 'Suela amortiguada, lista para la ciudad.', 'sizes' => ['39', '40', '41', '42', '43', '44']],
            ['name' => 'Camiseta Soft Rib', 'price' => 35, 'category' => 'tshirts', 'image' => 'img-5', 'description' => 'Textura acanalada sutil, fit slim.', 'sizes' => ['S', 'M', 'L']],
            ['name' => 'Sudadera Cloud', 'price' => 86, 'category' => 'hoodies', 'image' => 'img-6', 'description' => 'Ajuste relajado con interior perchado.', 'sizes' => ['S', 'M', 'L', 'XL']],
            ['name' => 'Pantalon Flow', 'price' => 72, 'category' => 'pants', 'image' => 'img-7', 'description' => 'Caida fluida con acabado sastre.', 'sizes' => ['S', 'M', 'L', 'XL']],
            ['name' => 'Cinturon Signature', 'price' => 26, 'category' => 'accessories', 'image' => 'img-4', 'description' => 'Hebilla mate, diseno minimalista.', 'sizes' => ['S', 'M', 'L']],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(['name' => $product['name']], $product);
        }
    }
}
