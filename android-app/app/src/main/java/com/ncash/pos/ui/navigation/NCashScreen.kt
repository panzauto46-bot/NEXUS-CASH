package com.ncash.pos.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AccountBalanceWallet
import androidx.compose.material.icons.rounded.Dashboard
import androidx.compose.material.icons.rounded.Groups
import androidx.compose.material.icons.rounded.Inventory2
import androidx.compose.material.icons.rounded.Payments
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.ui.graphics.vector.ImageVector

sealed class NCashScreen(
    val route: String,
    val title: String,
    val icon: ImageVector
) {
    data object Dashboard : NCashScreen("dashboard", "Dashboard", Icons.Rounded.Dashboard)
    data object Products : NCashScreen("products", "Product Catalog", Icons.Rounded.Inventory2)
    data object Transactions : NCashScreen("transactions", "Transactions", Icons.Rounded.Payments)
    data object Treasury : NCashScreen("treasury", "CashToken Treasury", Icons.Rounded.AccountBalanceWallet)
    data object Customers : NCashScreen("customers", "Customers", Icons.Rounded.Groups)
    data object Employees : NCashScreen("employees", "Employees", Icons.Rounded.Person)
    data object Settings : NCashScreen("settings", "Settings", Icons.Rounded.Settings)

    companion object {
        val all = listOf(
            Dashboard,
            Products,
            Transactions,
            Treasury,
            Customers,
            Employees,
            Settings
        )
    }
}
