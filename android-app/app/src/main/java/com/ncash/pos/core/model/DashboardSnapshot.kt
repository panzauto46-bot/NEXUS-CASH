package com.ncash.pos.core.model

data class DailyVolume(
    val day: String,
    val bch: Double,
    val usd: Double
)

data class DashboardSnapshot(
    val weeklyBch: Double,
    val transactionCount: Int,
    val mintedTokens: Int,
    val activeCustomers: Int,
    val dailyVolumes: List<DailyVolume>,
    val recentTransactions: List<SaleTransaction>
)
