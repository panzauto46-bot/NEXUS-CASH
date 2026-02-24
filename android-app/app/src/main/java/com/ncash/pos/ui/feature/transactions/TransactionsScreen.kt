package com.ncash.pos.ui.feature.transactions

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.weight
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.ncash.pos.core.model.SaleTransaction
import com.ncash.pos.core.model.TransactionStatus
import com.ncash.pos.core.util.CurrencyFormat

@Composable
fun TransactionsScreen(viewModel: TransactionsViewModel = viewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    LazyColumn(
        modifier = Modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("Transactions", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                SummaryCard(modifier = Modifier.weight(1f), label = "Total Today", value = CurrencyFormat.usd(state.totalTodayUsd))
                SummaryCard(modifier = Modifier.weight(1f), label = "Successful", value = state.confirmedCount.toString())
            }
        }
        item {
            OutlinedTextField(
                value = state.search,
                onValueChange = viewModel::onSearchChange,
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                label = { Text("Search by Tx ID or wallet") }
            )
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("all", "confirmed", "pending", "failed").forEach { status ->
                    AssistChip(onClick = { viewModel.onStatusChange(status) }, label = { Text(status.uppercase()) })
                }
            }
        }
        items(state.filteredTransactions) { tx ->
            TransactionCard(tx = tx)
        }
    }
}

@Composable
private fun SummaryCard(
    modifier: Modifier = Modifier,
    label: String,
    value: String
) {
    Card(modifier = modifier) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(label, style = MaterialTheme.typography.labelSmall)
            Text(value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun TransactionCard(tx: SaleTransaction) {
    val statusColor = when (tx.status) {
        TransactionStatus.CONFIRMED -> MaterialTheme.colorScheme.primary
        TransactionStatus.PENDING -> MaterialTheme.colorScheme.secondary
        TransactionStatus.FAILED -> MaterialTheme.colorScheme.error
    }

    Card {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(tx.id, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                Text(tx.status.name, style = MaterialTheme.typography.labelSmall, color = statusColor)
            }
            Text(tx.customerWallet, style = MaterialTheme.typography.bodyMedium)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("${tx.amountBch} BCH", style = MaterialTheme.typography.bodyMedium)
                Text(CurrencyFormat.usd(tx.amountUsd), style = MaterialTheme.typography.bodyMedium)
            }
            Text("${tx.date} ${tx.time}", style = MaterialTheme.typography.labelSmall)
        }
    }
}
