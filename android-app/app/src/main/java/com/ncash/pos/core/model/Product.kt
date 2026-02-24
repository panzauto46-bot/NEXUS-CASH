package com.ncash.pos.core.model

data class Product(
    val id: String,
    val name: String,
    val sku: String,
    val priceUsd: Double,
    val priceBch: Double,
    val stock: Int,
    val category: String
)
