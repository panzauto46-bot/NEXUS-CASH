package com.ncash.pos.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AccountBalanceWallet
import androidx.compose.material.icons.rounded.Menu
import androidx.compose.material.icons.rounded.Notifications
import androidx.compose.material3.AssistChip
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.ncash.pos.ui.feature.customers.CustomersScreen
import com.ncash.pos.ui.feature.dashboard.DashboardScreen
import com.ncash.pos.ui.feature.employees.EmployeesScreen
import com.ncash.pos.ui.feature.products.ProductsScreen
import com.ncash.pos.ui.feature.settings.SettingsScreen
import com.ncash.pos.ui.feature.transactions.TransactionsScreen
import com.ncash.pos.ui.feature.treasury.TreasuryScreen
import com.ncash.pos.ui.navigation.NCashScreen
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NCashPosApp() {
    val navController = rememberNavController()
    val drawerState = rememberDrawerState(initialValue = androidx.compose.material3.DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val navBackStack by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStack?.destination?.route
    val currentScreen = NCashScreen.all.firstOrNull { it.route == currentRoute } ?: NCashScreen.Dashboard

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("NexusCash", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("Commerce OS", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
                }
                NCashScreen.all.forEach { screen ->
                    NavigationDrawerItem(
                        icon = { Icon(screen.icon, contentDescription = screen.title) },
                        label = { Text(screen.title) },
                        selected = currentRoute == screen.route,
                        onClick = {
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                            scope.launch { drawerState.close() }
                        },
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                    )
                }
            }
        }
    ) {
        Scaffold(
            modifier = Modifier.fillMaxSize(),
            topBar = {
                TopAppBar(
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    ),
                    title = {
                        Column {
                            Text(
                                text = "N-CASH CONTROL",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Text(text = currentScreen.title, style = MaterialTheme.typography.titleLarge)
                        }
                    },
                    navigationIcon = {
                        IconButton(onClick = { scope.launch { drawerState.open() } }) {
                            Icon(Icons.Rounded.Menu, contentDescription = "Open menu")
                        }
                    },
                    actions = {
                        AssistChip(
                            onClick = {},
                            label = { Text("0.842 BCH") },
                            leadingIcon = {
                                Icon(Icons.Rounded.AccountBalanceWallet, contentDescription = null)
                            }
                        )
                        IconButton(onClick = {}) {
                            Icon(Icons.Rounded.Notifications, contentDescription = "Notifications")
                        }
                    }
                )
            }
        ) { padding ->
            NavHost(
                navController = navController,
                startDestination = NCashScreen.Dashboard.route,
                modifier = Modifier.padding(padding)
            ) {
                composable(NCashScreen.Dashboard.route) { DashboardScreen() }
                composable(NCashScreen.Products.route) { ProductsScreen() }
                composable(NCashScreen.Transactions.route) { TransactionsScreen() }
                composable(NCashScreen.Treasury.route) { TreasuryScreen() }
                composable(NCashScreen.Customers.route) { CustomersScreen() }
                composable(NCashScreen.Employees.route) { EmployeesScreen() }
                composable(NCashScreen.Settings.route) { SettingsScreen() }
            }
        }
    }
}
