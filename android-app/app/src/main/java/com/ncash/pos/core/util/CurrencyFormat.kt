package com.ncash.pos.core.util

import java.text.NumberFormat
import java.util.Locale

object CurrencyFormat {
    private val usdFormatter = NumberFormat.getCurrencyInstance(Locale.US)

    fun usd(value: Double): String = usdFormatter.format(value)
}
