package com.ncash.pos.ui.feature.settings

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

data class SettingsUiState(
    val selectedFiat: String = "USD - US Dollar",
    val priceOracle: String = "CoinGecko API (Free)",
    val slippage: String = "0.5",
    val refreshInterval: String = "30s"
)

class SettingsViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    fun onFiatChange(value: String) {
        _uiState.update { it.copy(selectedFiat = value) }
    }
}
