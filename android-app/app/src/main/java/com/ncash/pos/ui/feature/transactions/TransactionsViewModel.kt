package com.ncash.pos.ui.feature.transactions

import androidx.lifecycle.ViewModel
import com.ncash.pos.core.model.SaleTransaction
import com.ncash.pos.core.model.TransactionStatus
import com.ncash.pos.core.repository.MockNCashRepository
import com.ncash.pos.core.repository.NCashRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

data class TransactionsUiState(
    val search: String = "",
    val statusFilter: String = "all",
    val transactions: List<SaleTransaction> = emptyList()
) {
    val filteredTransactions: List<SaleTransaction>
        get() = transactions.filter { tx ->
            val statusMatches = statusFilter == "all" || tx.status.name.equals(statusFilter, ignoreCase = true)
            val searchMatches = tx.id.contains(search, ignoreCase = true) ||
                tx.customerWallet.contains(search, ignoreCase = true)
            statusMatches && searchMatches
        }

    val totalTodayUsd: Double
        get() = transactions.sumOf { it.amountUsd }

    val confirmedCount: Int
        get() = transactions.count { it.status == TransactionStatus.CONFIRMED }
}

class TransactionsViewModel(
    private val repository: NCashRepository = MockNCashRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow(
        TransactionsUiState(transactions = repository.getTransactions())
    )
    val uiState: StateFlow<TransactionsUiState> = _uiState.asStateFlow()

    fun onSearchChange(value: String) {
        _uiState.update { it.copy(search = value) }
    }

    fun onStatusChange(value: String) {
        _uiState.update { it.copy(statusFilter = value) }
    }
}
