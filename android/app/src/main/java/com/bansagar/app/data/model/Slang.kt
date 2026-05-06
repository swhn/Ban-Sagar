package com.bansagar.app.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Slang(
    val id: String = "",
    val slug: String = "",
    val word: String = "",
    val pronunciation: String? = null,
    val meaning: String = "",
    @SerialName("meaning_burmese") val meaningBurmese: String? = null,
    val examples: List<String> = emptyList(),
    @SerialName("author_id") val authorId: String = "",
    @SerialName("author_name") val authorName: String? = null,
    val status: String = "pending",
    val upvotes: Int = 0,
    val downvotes: Int = 0,
    val views: Int = 0,
    @SerialName("is_nsfw") val isNsfw: Boolean = false,
    @SerialName("created_at") val createdAt: String = "",
)
