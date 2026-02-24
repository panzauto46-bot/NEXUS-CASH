package com.ncash.pos.core.repository

import com.ncash.pos.core.model.Customer
import com.ncash.pos.core.model.DashboardSnapshot
import com.ncash.pos.core.model.Employee
import com.ncash.pos.core.model.Product
import com.ncash.pos.core.model.SaleTransaction
import com.ncash.pos.core.model.TreasurySnapshot

interface NCashRepository {
    fun getBchToUsd(): Double
    fun getProducts(): List<Product>
    fun getTransactions(): List<SaleTransaction>
    fun getDashboardSnapshot(): DashboardSnapshot
    fun getTreasurySnapshot(): TreasurySnapshot
    fun getCustomers(): List<Customer>
    fun getEmployees(): List<Employee>
}
