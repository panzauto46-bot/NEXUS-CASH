package com.ncash.pos.ui.feature.employees

import androidx.lifecycle.ViewModel
import com.ncash.pos.core.model.Employee
import com.ncash.pos.core.repository.MockNCashRepository
import com.ncash.pos.core.repository.NCashRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class EmployeesUiState(
    val employees: List<Employee> = emptyList()
)

class EmployeesViewModel(
    private val repository: NCashRepository = MockNCashRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow(
        EmployeesUiState(employees = repository.getEmployees())
    )
    val uiState: StateFlow<EmployeesUiState> = _uiState.asStateFlow()
}
