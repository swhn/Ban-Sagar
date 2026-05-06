package com.bansagar.app.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bansagar.app.data.model.Slang
import com.bansagar.app.domain.repository.SlangRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class SortTab { Trending, Latest, Top, Random }

data class HomeUiState(
    val slangs: List<Slang> = emptyList(),
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: String? = null,
    val activeTab: SortTab = SortTab.Trending,
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val repository: SlangRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadSlangs()
    }

    fun selectTab(tab: SortTab) {
        _uiState.value = _uiState.value.copy(activeTab = tab)
        loadSlangs()
    }

    fun refresh() {
        _uiState.value = _uiState.value.copy(isRefreshing = true)
        loadSlangs()
    }

    private fun loadSlangs() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = _uiState.value.slangs.isEmpty(), error = null)
            try {
                val slangs = when (_uiState.value.activeTab) {
                    SortTab.Trending -> repository.getTrending()
                    SortTab.Latest -> repository.getLatest()
                    SortTab.Top -> repository.getTop()
                    SortTab.Random -> repository.getRandom()
                }
                _uiState.value = _uiState.value.copy(
                    slangs = slangs,
                    isLoading = false,
                    isRefreshing = false,
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = e.message ?: "Failed to load",
                    isLoading = false,
                    isRefreshing = false,
                )
            }
        }
    }
}
