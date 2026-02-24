package com.ncash.pos.ui.feature.dashboard

import androidx.lifecycle.ViewModel
import com.ncash.pos.core.model.DashboardSnapshot
import com.ncash.pos.core.repository.MockNCashRepository
import com.ncash.pos.core.repository.NCashRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class DashboardUiState(
    val snapshot: DashboardSnapshot
)

class DashboardViewModel(
    private val repository: NCashRepository = MockNCashRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow(
        DashboardUiState(snapshot = repository.getDashboardSnapshot())
    )
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()
}
