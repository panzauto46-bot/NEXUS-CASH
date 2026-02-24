package com.ncash.pos.core.model

enum class TransactionStatus {
    CONFIRMED,
    PENDING,
    FAILED
}

data class SaleTransaction(
    val id: String,
    val customerWallet: String,
    val items: List<String>,
    val amountBch: Double,
    val amountUsd: Double,
    val status: TransactionStatus,
    val time: String,
    val date: String
)
