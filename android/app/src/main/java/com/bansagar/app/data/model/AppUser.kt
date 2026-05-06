package com.bansagar.app.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AppUser(
    val id: String = "",
    val email: String = "",
    @SerialName("display_name") val displayName: String? = null,
    @SerialName("avatar_url") val avatarUrl: String? = null,
    val role: String = "user",
    @SerialName("show_nsfw") val showNsfw: Boolean = false,
    @SerialName("notify_approved") val notifyApproved: Boolean = true,
    @SerialName("notify_badges") val notifyBadges: Boolean = true,
    @SerialName("created_at") val createdAt: String = "",
)
