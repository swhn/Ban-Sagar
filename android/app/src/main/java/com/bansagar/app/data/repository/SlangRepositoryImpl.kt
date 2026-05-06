package com.bansagar.app.data.repository

import com.bansagar.app.data.model.Slang
import com.bansagar.app.domain.repository.SlangRepository
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import io.github.jan.supabase.postgrest.rpc
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import javax.inject.Inject

class SlangRepositoryImpl @Inject constructor(
    private val client: SupabaseClient,
) : SlangRepository {

    override suspend fun getTrending(limit: Int): List<Slang> {
        return client.from("slangs").select {
            filter { eq("status", "approved") }
            order("upvotes", Order.DESCENDING)
            limit(limit.toLong())
        }.decodeList()
    }

    override suspend fun getLatest(limit: Int): List<Slang> {
        return client.from("slangs").select {
            filter { eq("status", "approved") }
            order("created_at", Order.DESCENDING)
            limit(limit.toLong())
        }.decodeList()
    }

    override suspend fun getTop(limit: Int): List<Slang> {
        return client.from("slangs").select {
            filter { eq("status", "approved") }
            order("views", Order.DESCENDING)
            limit(limit.toLong())
        }.decodeList()
    }

    override suspend fun getRandom(limit: Int): List<Slang> {
        val all: List<Slang> = client.from("slangs").select {
            filter { eq("status", "approved") }
        }.decodeList()
        return all.shuffled().take(limit)
    }

    override suspend fun search(query: String): List<Slang> {
        return client.from("slangs").select {
            filter {
                eq("status", "approved")
                or {
                    ilike("word", "%$query%")
                    ilike("meaning", "%$query%")
                    ilike("meaning_burmese", "%$query%")
                }
            }
            limit(30)
        }.decodeList()
    }

    override suspend fun getBySlug(slug: String): Slang? {
        return try {
            client.from("slangs").select {
                filter { eq("slug", slug) }
                limit(1)
            }.decodeSingleOrNull()
        } catch (_: Exception) {
            try {
                client.from("slangs").select {
                    filter { eq("id", slug) }
                    limit(1)
                }.decodeSingleOrNull()
            } catch (_: Exception) {
                null
            }
        }
    }

    override suspend fun getRelated(slang: Slang, limit: Int): List<Slang> {
        val keywords = slang.meaning
            .lowercase()
            .split(Regex("\\W+"))
            .filter { it.length > 3 && it.matches(Regex("^[a-z]+$")) }
            .take(5)

        val related = mutableListOf<Slang>()

        for (keyword in keywords) {
            if (related.size >= limit) break
            try {
                val results: List<Slang> = client.from("slangs").select {
                    filter {
                        eq("status", "approved")
                        neq("id", slang.id)
                        ilike("meaning", "%$keyword%")
                    }
                    limit(limit.toLong())
                }.decodeList()
                for (item in results) {
                    if (related.none { it.id == item.id }) {
                        related.add(item)
                    }
                }
            } catch (_: Exception) { }
        }

        if (related.size < 4) {
            try {
                val popular: List<Slang> = client.from("slangs").select {
                    filter {
                        eq("status", "approved")
                        neq("id", slang.id)
                    }
                    order("upvotes", Order.DESCENDING)
                    limit(limit.toLong())
                }.decodeList()
                for (item in popular) {
                    if (related.none { it.id == item.id }) {
                        related.add(item)
                    }
                }
            } catch (_: Exception) { }
        }

        return related.take(limit)
    }

    override suspend fun incrementView(slangId: String) {
        try {
            client.postgrest.rpc("increment_view", buildJsonObject {
                put("p_slang_id", slangId)
            })
        } catch (_: Exception) { }
    }
}
