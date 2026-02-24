package com.ncash.pos.ui.feature.dashboard

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.weight
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.ncash.pos.core.model.SaleTransaction
import com.ncash.pos.core.util.CurrencyFormat

@Composable
fun DashboardScreen(viewModel: DashboardViewModel = viewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snapshot = state.snapshot
    val maxBch = snapshot.dailyVolumes.maxOfOrNull { it.bch } ?: 1.0

    LazyColumn(
        modifier = Modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text(
                text = "N-CASH CONTROL",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.primary
            )
        }
        item {
            Text(
                text = "Dashboard Overview",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                MetricCard(
                    modifier = Modifier.weight(1f),
                    label = "Total BCH This Week",
                    value = "${snapshot.weeklyBch} BCH"
                )
                MetricCard(
                    modifier = Modifier.weight(1f),
                    label = "Transactions",
                    value = snapshot.transactionCount.toString()
                )
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                MetricCard(
                    modifier = Modifier.weight(1f),
                    label = "Minted Tokens",
                    value = snapshot.mintedTokens.toString()
                )
                MetricCard(
                    modifier = Modifier.weight(1f),
                    label = "Active Customers",
                    value = snapshot.activeCustomers.toString()
                )
            }
        }
        item {
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text("Daily BCH Volume", style = MaterialTheme.typography.titleMedium)
                    snapshot.dailyVolumes.forEach { volume ->
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(volume.day, style = MaterialTheme.typography.bodyMedium)
                                Text(
                                    "${volume.bch} BCH (${CurrencyFormat.usd(volume.usd)})",
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }
                            LinearProgressIndicator(
                                progress = { (volume.bch / maxBch).toFloat() },
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }
            }
        }
        item {
            Text(
                text = "Latest Transactions",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
        }
        items(snapshot.recentTransactions) { tx ->
            TransactionListItem(tx = tx)
        }
    }
}

@Composable
private fun MetricCard(
    modifier: Modifier = Modifier,
    label: String,
    value: String
) {
    Card(modifier = modifier) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(label, style = MaterialTheme.typography.labelSmall)
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
private fun TransactionListItem(tx: SaleTransaction) {
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
                Text(tx.status.name, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
            }
            Text(tx.customerWallet, style = MaterialTheme.typography.bodyMedium)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("${tx.amountBch} BCH", style = MaterialTheme.typography.bodyMedium)
                Text(CurrencyFormat.usd(tx.amountUsd), style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}
