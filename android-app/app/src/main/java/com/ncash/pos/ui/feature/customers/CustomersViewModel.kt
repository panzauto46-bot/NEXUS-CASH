package com.ncash.pos.ui.feature.customers

import androidx.lifecycle.ViewModel
import com.ncash.pos.core.model.Customer
import com.ncash.pos.core.repository.MockNCashRepository
import com.ncash.pos.core.repository.NCashRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class CustomersUiState(
    val customers: List<Customer> = emptyList()
)

class CustomersViewModel(
    private val repository: NCashRepository = MockNCashRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow(
        CustomersUiState(customers = repository.getCustomers())
    )
    val uiState: StateFlow<CustomersUiState> = _uiState.asStateFlow()
}
