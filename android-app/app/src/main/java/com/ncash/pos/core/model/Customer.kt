package com.ncash.pos.core.model

data class Customer(
    val wallet: String,
    val totalSpentBch: Double,
    val visits: Int,
    val tier: String
)
