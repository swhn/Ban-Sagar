package com.bansagar.app.di

import com.bansagar.app.BuildConfig
import com.bansagar.app.data.repository.SlangRepositoryImpl
import com.bansagar.app.domain.repository.SlangRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideSupabaseClient(): SupabaseClient {
        return createSupabaseClient(
            supabaseUrl = BuildConfig.SUPABASE_URL,
            supabaseKey = BuildConfig.SUPABASE_ANON_KEY,
        ) {
            install(Postgrest)
        }
    }

    @Provides
    @Singleton
    fun provideSlangRepository(client: SupabaseClient): SlangRepository {
        return SlangRepositoryImpl(client)
    }
}
