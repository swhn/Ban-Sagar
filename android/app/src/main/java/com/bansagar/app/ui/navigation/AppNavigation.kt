package com.bansagar.app.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import androidx.navigation.navDeepLink
import com.bansagar.app.ui.contribute.ContributeScreen
import com.bansagar.app.ui.detail.SlangDetailScreen
import com.bansagar.app.ui.home.HomeScreen
import com.bansagar.app.ui.profile.ProfileScreen
import com.bansagar.app.ui.search.SearchScreen

object Routes {
    const val HOME = "home"
    const val SEARCH = "search"
    const val CONTRIBUTE = "contribute"
    const val PROFILE = "profile"
    const val SLANG_DETAIL = "slang/{slug}"

    fun slangDetail(slug: String) = "slang/$slug"
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val showBottomBar = currentRoute in listOf(
        Routes.HOME, Routes.SEARCH, Routes.CONTRIBUTE, Routes.PROFILE
    )

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                BottomNavBar(
                    currentRoute = currentRoute,
                    onNavigate = { route ->
                        navController.navigate(route) {
                            popUpTo(Routes.HOME) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                )
            }
        },
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Routes.HOME,
            modifier = Modifier.padding(innerPadding),
        ) {
            composable(Routes.HOME) {
                HomeScreen(
                    onSlangClick = { slug -> navController.navigate(Routes.slangDetail(slug)) },
                )
            }
            composable(Routes.SEARCH) {
                SearchScreen(
                    onSlangClick = { slug -> navController.navigate(Routes.slangDetail(slug)) },
                )
            }
            composable(Routes.CONTRIBUTE) {
                ContributeScreen()
            }
            composable(Routes.PROFILE) {
                ProfileScreen()
            }
            composable(
                route = Routes.SLANG_DETAIL,
                arguments = listOf(navArgument("slug") { type = NavType.StringType }),
                deepLinks = listOf(navDeepLink { uriPattern = "https://bansagar.com/slang/{slug}" }),
            ) { backStackEntry ->
                val slug = backStackEntry.arguments?.getString("slug") ?: return@composable
                SlangDetailScreen(
                    slug = slug,
                    onBack = { navController.popBackStack() },
                    onSlangClick = { s -> navController.navigate(Routes.slangDetail(s)) },
                )
            }
        }
    }
}
