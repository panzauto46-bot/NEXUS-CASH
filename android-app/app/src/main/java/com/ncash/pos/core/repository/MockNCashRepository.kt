package com.ncash.pos.core.repository

import com.ncash.pos.core.model.Customer
import com.ncash.pos.core.model.DailyVolume
import com.ncash.pos.core.model.DashboardSnapshot
import com.ncash.pos.core.model.Employee
import com.ncash.pos.core.model.Product
import com.ncash.pos.core.model.SaleTransaction
import com.ncash.pos.core.model.TransactionStatus
import com.ncash.pos.core.model.TreasurySnapshot

object MockNCashRepository : NCashRepository {
    private const val BCH_TO_USD = 300.0

    private val products = listOf(
        Product("1", "Americano Coffee", "BEV-001", 1.68, 0.0056, 999, "Beverage"),
        Product("2", "Special Fried Rice", "FOD-001", 2.34, 0.0078, 50, "Food"),
        Product("3", "Butter Croissant", "FOD-002", 1.20, 0.0040, 25, "Food"),
        Product("4", "Matcha Latte", "BEV-002", 2.13, 0.0071, 999, "Beverage"),
        Product("5", "Classic Burger", "FOD-003", 2.79, 0.0093, 30, "Food"),
        Product("6", "Fresh Orange Juice", "BEV-003", 1.32, 0.0044, 999, "Beverage"),
        Product("7", "Carbonara Pasta", "FOD-004", 3.21, 0.0107, 20, "Food"),
        Product("8", "Cheesecake Slice", "FOD-005", 1.86, 0.0062, 15, "Food")
    )

    private val transactions = listOf(
        SaleTransaction(
            id = "TX-0042",
            customerWallet = "bitcoincash:qz3f...8a2c",
            items = listOf("Americano Coffee x2", "Butter Croissant x1"),
            amountBch = 0.0152,
            amountUsd = 4.56,
            status = TransactionStatus.CONFIRMED,
            time = "14:32",
            date = "2024-01-15"
        ),
        SaleTransaction(
            id = "TX-0041",
            customerWallet = "bitcoincash:qp7b...1d4e",
            items = listOf("Matcha Latte x1"),
            amountBch = 0.0071,
            amountUsd = 2.13,
            status = TransactionStatus.CONFIRMED,
            time = "14:24",
            date = "2024-01-15"
        ),
        SaleTransaction(
            id = "TX-0040",
            customerWallet = "bitcoincash:qa1x...9f3b",
            items = listOf(
                "Classic Burger x1",
                "Fresh Orange Juice x2",
                "Carbonara Pasta x1",
                "Cheesecake Slice x1"
            ),
            amountBch = 0.0328,
            amountUsd = 9.84,
            status = TransactionStatus.PENDING,
            time = "14:18",
            date = "2024-01-15"
        ),
        SaleTransaction(
            id = "TX-0039",
            customerWallet = "bitcoincash:qc8m...2e7a",
            items = listOf("Special Fried Rice x1", "Americano Coffee x1"),
            amountBch = 0.0134,
            amountUsd = 4.02,
            status = TransactionStatus.CONFIRMED,
            time = "13:55",
            date = "2024-01-15"
        ),
        SaleTransaction(
            id = "TX-0038",
            customerWallet = "bitcoincash:q5dr...4c1f",
            items = listOf("Carbonara Pasta x2"),
            amountBch = 0.0214,
            amountUsd = 6.42,
            status = TransactionStatus.FAILED,
            time = "13:42",
            date = "2024-01-15"
        ),
        SaleTransaction(
            id = "TX-0037",
            customerWallet = "bitcoincash:qe9k...7b5d",
            items = listOf("Cheesecake Slice x3"),
            amountBch = 0.0186,
            amountUsd = 5.58,
            status = TransactionStatus.CONFIRMED,
            time = "13:15",
            date = "2024-01-15"
        )
    )

    override fun getBchToUsd(): Double = BCH_TO_USD

    override fun getProducts(): List<Product> = products

    override fun getTransactions(): List<SaleTransaction> = transactions

    override fun getDashboardSnapshot(): DashboardSnapshot {
        return DashboardSnapshot(
            weeklyBch = 6.47,
            transactionCount = 156,
            mintedTokens = 4_680,
            activeCustomers = 89,
            dailyVolumes = listOf(
                DailyVolume("Mon", 0.42, 126.0),
                DailyVolume("Tue", 0.68, 204.0),
                DailyVolume("Wed", 0.55, 165.0),
                DailyVolume("Thu", 0.91, 273.0),
                DailyVolume("Fri", 1.23, 369.0),
                DailyVolume("Sat", 1.56, 468.0),
                DailyVolume("Sun", 1.12, 336.0)
            ),
            recentTransactions = transactions.take(5)
        )
    }

    override fun getTreasurySnapshot(): TreasurySnapshot {
        val hotWalletBch = 0.842
        return TreasurySnapshot(
            totalSupply = 100_000,
            distributed = 45_000,
            available = 35_000,
            burned = 20_000,
            hotWalletBch = hotWalletBch,
            hotWalletUsd = hotWalletBch * BCH_TO_USD
        )
    }

    override fun getCustomers(): List<Customer> {
        return listOf(
            Customer("bitcoincash:qz3f...8a2c", 0.214, 18, "Gold"),
            Customer("bitcoincash:qp7b...1d4e", 0.143, 12, "Silver"),
            Customer("bitcoincash:qc8m...2e7a", 0.088, 9, "Bronze"),
            Customer("bitcoincash:qe9k...7b5d", 0.172, 15, "Gold")
        )
    }

    override fun getEmployees(): List<Employee> {
        return listOf(
            Employee(name = "Owner Admin", role = "Owner", shift = "All day", transactionsHandled = 0),
            Employee(name = "Cashier A", role = "Cashier", shift = "Morning", transactionsHandled = 74),
            Employee(name = "Cashier B", role = "Cashier", shift = "Evening", transactionsHandled = 82)
        )
    }
}
