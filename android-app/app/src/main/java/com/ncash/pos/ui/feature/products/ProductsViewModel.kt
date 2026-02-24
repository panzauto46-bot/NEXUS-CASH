package com.ncash.pos.ui.feature.products

import androidx.lifecycle.ViewModel
import com.ncash.pos.core.model.Product
import com.ncash.pos.core.repository.MockNCashRepository
import com.ncash.pos.core.repository.NCashRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

data class ProductsUiState(
    val bchToUsd: Double = 0.0,
    val search: String = "",
    val selectedCategory: String = "All",
    val products: List<Product> = emptyList()
) {
    val categories: List<String>
        get() = listOf("All", "Food", "Beverage")

    val filteredProducts: List<Product>
        get() = products.filter { product ->
            (selectedCategory == "All" || product.category == selectedCategory) &&
                product.name.contains(search, ignoreCase = true)
        }
}

class ProductsViewModel(
    private val repository: NCashRepository = MockNCashRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow(
        ProductsUiState(
            bchToUsd = repository.getBchToUsd(),
            products = repository.getProducts()
        )
    )
    val uiState: StateFlow<ProductsUiState> = _uiState.asStateFlow()

    fun onSearchChange(value: String) {
        _uiState.update { it.copy(search = value) }
    }

    fun onCategoryChange(value: String) {
        _uiState.update { it.copy(selectedCategory = value) }
    }
}
