import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'services/auth_service.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/partida_screen.dart';
import 'screens/acerto_screen.dart';
import 'screens/ranking_screen.dart';

void main() {
  runApp(const PokerApp());
}

final _router = GoRouter(
  initialLocation: '/dashboard',
  redirect: (context, state) async {
    final loggedIn = await AuthService.isLoggedIn();
    final onLogin = state.uri.toString() == '/login';
    if (!loggedIn && !onLogin) return '/login';
    if (loggedIn && onLogin) return '/dashboard';
    return null;
  },
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(path: '/dashboard', builder: (context, state) => const DashboardScreen()),
    GoRoute(path: '/partida', builder: (context, state) => const PartidaScreen()),
    GoRoute(path: '/acerto', builder: (context, state) => const AcertoScreen()),
    GoRoute(path: '/ranking', builder: (context, state) => const RankingScreen()),
  ],
);

class PokerApp extends StatelessWidget {
  const PokerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'PokerApp',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF2d6a2d),
          secondary: Color(0xFFc9a84c),
          surface: Color(0xFF111611),
        ),
        scaffoldBackgroundColor: const Color(0xFF0a0e0a),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF111611),
          foregroundColor: Color(0xFFe8e8e0),
          elevation: 0,
        ),
        drawerTheme: const DrawerThemeData(
          backgroundColor: Color(0xFF111611),
        ),
        progressIndicatorTheme: const ProgressIndicatorThemeData(
          color: Color(0xFFc9a84c),
        ),
      ),
      routerConfig: _router,
    );
  }
}
