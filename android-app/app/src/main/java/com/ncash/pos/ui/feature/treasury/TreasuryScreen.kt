package com.ncash.pos.ui.feature.treasury

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.weight
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.ncash.pos.core.util.CurrencyFormat

@Composable
fun TreasuryScreen(viewModel: TreasuryViewModel = viewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val treasury = state.snapshot

    LazyColumn(
        modifier = Modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("CashToken Treasury", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                MetricCard(modifier = Modifier.weight(1f), label = "Total Supply", value = treasury.totalSupply.toString())
                MetricCard(modifier = Modifier.weight(1f), label = "Distributed", value = treasury.distributed.toString())
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                MetricCard(modifier = Modifier.weight(1f), label = "Available", value = treasury.available.toString())
                MetricCard(modifier = Modifier.weight(1f), label = "Burned", value = treasury.burned.toString())
            }
        }
        item {
            Card {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text("Settlement and Sweeping", style = MaterialTheme.typography.titleMedium)
                    Text("Hot wallet: ${treasury.hotWalletBch} BCH", style = MaterialTheme.typography.bodyMedium)
                    Text("Estimated fiat: ${CurrencyFormat.usd(treasury.hotWalletUsd)}", style = MaterialTheme.typography.bodyMedium)
                    Text(
                        "Recommendation: sweep BCH to cold wallet when balance exceeds 1 BCH.",
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            }
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
            Text(value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        }
    }
}
