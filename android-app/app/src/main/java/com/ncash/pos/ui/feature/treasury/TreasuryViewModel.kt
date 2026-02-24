package com.ncash.pos.ui.feature.treasury

import androidx.lifecycle.ViewModel
import com.ncash.pos.core.model.TreasurySnapshot
import com.ncash.pos.core.repository.MockNCashRepository
import com.ncash.pos.core.repository.NCashRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class TreasuryUiState(
    val snapshot: TreasurySnapshot
)

class TreasuryViewModel(
    private val repository: NCashRepository = MockNCashRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow(
        TreasuryUiState(snapshot = repository.getTreasurySnapshot())
    )
    val uiState: StateFlow<TreasuryUiState> = _uiState.asStateFlow()
}
