package com.ncash.pos.core.model

data class TreasurySnapshot(
    val totalSupply: Int,
    val distributed: Int,
    val available: Int,
    val burned: Int,
    val hotWalletBch: Double,
    val hotWalletUsd: Double
)
