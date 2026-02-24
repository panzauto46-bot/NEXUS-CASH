package com.ncash.pos.core.model

data class Employee(
    val name: String,
    val role: String,
    val shift: String,
    val transactionsHandled: Int
)
