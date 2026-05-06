package com.bansagar.app.ui.detail

import androidx.lifecycle.SavedStateHandle
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

data class DetailUiState(
    val slang: Slang? = null,
    val relatedWords: List<Slang> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null,
)

@HiltViewModel
class SlangDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: SlangRepository,
) : ViewModel() {

    private val slug: String = savedStateHandle["slug"] ?: ""

    private val _uiState = MutableStateFlow(DetailUiState())
    val uiState: StateFlow<DetailUiState> = _uiState.asStateFlow()

    init {
        loadSlang()
    }

    private fun loadSlang() {
        viewModelScope.launch {
            try {
                val slang = repository.getBySlug(slug)
                if (slang != null) {
                    _uiState.value = DetailUiState(slang = slang, isLoading = false)
                    repository.incrementView(slang.id)
                    loadRelated(slang)
                } else {
                    _uiState.value = DetailUiState(error = "Word not found", isLoading = false)
                }
            } catch (e: Exception) {
                _uiState.value = DetailUiState(error = e.message, isLoading = false)
            }
        }
    }

    private fun loadRelated(slang: Slang) {
        viewModelScope.launch {
            try {
                val related = repository.getRelated(slang)
                _uiState.value = _uiState.value.copy(relatedWords = related)
            } catch (_: Exception) { }
        }
    }
}
