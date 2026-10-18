<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;

Route::view('/', 'index');
Route::view('/index', 'index');
Route::view('/about', 'about');
Route::view('/admin', 'admin');
Route::view('/cart', 'cart');
Route::view('/checkout', 'checkout');
Route::view('/contact', 'contact');
Route::view('/forgot-password', 'forgot-password');
Route::view('/login', 'login');
Route::view('/orders', 'orders');
Route::view('/product', 'product');
Route::view('/profile', 'profile');
Route::view('/register', 'register');
Route::view('/shop', 'shop');
Route::get('/api/products', [ProductController::class, 'index']);