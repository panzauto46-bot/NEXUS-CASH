package com.ncash.pos.ui.feature.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
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
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.rememberCameraPositionState

@Composable
fun SettingsScreen(viewModel: SettingsViewModel = viewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val storePosition = LatLng(-6.2088, 106.8456)
    val cameraState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(storePosition, 13f)
    }

    LazyColumn(
        modifier = Modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("Settings", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        }
        item {
            Card {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text("API and Exchange Rate", style = MaterialTheme.typography.titleMedium)
                    OutlinedTextField(
                        value = state.priceOracle,
                        onValueChange = {},
                        modifier = Modifier.fillMaxWidth(),
                        readOnly = true,
                        label = { Text("Price Oracle") }
                    )
                    OutlinedTextField(
                        value = state.selectedFiat,
                        onValueChange = {},
                        modifier = Modifier.fillMaxWidth(),
                        readOnly = true,
                        label = { Text("Fiat Currency") }
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("USD - US Dollar", "EUR - Euro").forEach { fiat ->
                            AssistChip(
                                onClick = { viewModel.onFiatChange(fiat) },
                                label = { Text(fiat) }
                            )
                        }
                    }
                    OutlinedTextField(
                        value = state.slippage,
                        onValueChange = {},
                        modifier = Modifier.fillMaxWidth(),
                        readOnly = true,
                        label = { Text("Slippage %") }
                    )
                    OutlinedTextField(
                        value = state.refreshInterval,
                        onValueChange = {},
                        modifier = Modifier.fillMaxWidth(),
                        readOnly = true,
                        label = { Text("Refresh Interval") }
                    )
                }
            }
        }
        item {
            Card {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text("Store Map Preview (Google Maps SDK)", style = MaterialTheme.typography.titleMedium)
                    Text(
                        "Foundation for Phase 3 geolocation is ready. Replace demo marker with live store data from Firebase.",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    GoogleMap(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(220.dp),
                        cameraPositionState = cameraState
                    ) {
                        Marker(
                            state = MarkerState(storePosition),
                            title = "N-Cash POS Demo Store",
                            snippet = "Jakarta"
                        )
                    }
                }
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
                    Text("Integration Checklist", style = MaterialTheme.typography.titleMedium)
                    Text("Firebase BoM configured", style = MaterialTheme.typography.bodyMedium)
                    Text("Google Maps SDK configured", style = MaterialTheme.typography.bodyMedium)
                    Text("Web3 BCH dependency scaffolded", style = MaterialTheme.typography.bodyMedium)
                    Text("MVVM structure initialized", style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }
}
