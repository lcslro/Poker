import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/auth_service.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: const Color(0xFF111611),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(24, 56, 24, 24),
            decoration: const BoxDecoration(
              color: Color(0xFF0a0e0a),
              border: Border(bottom: BorderSide(color: Color(0xFF1f2e1f))),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('♠', style: TextStyle(fontSize: 28, color: Color(0xFFc9a84c))),
                SizedBox(height: 4),
                Text('PokerApp',
                    style: TextStyle(
                        color: Color(0xFFe8e8e0),
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5)),
              ],
            ),
          ),
          const SizedBox(height: 8),
          _drawerItem(context, Icons.dashboard_outlined, 'Dashboard', '/dashboard'),
          _drawerItem(context, Icons.casino_outlined, 'Partida', '/partida'),
          _drawerItem(context, Icons.swap_horiz, 'Acerto', '/acerto'),
          _drawerItem(context, Icons.leaderboard_outlined, 'Ranking', '/ranking'),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: ListTile(
              leading: const Icon(Icons.logout, color: Color(0xFFe74c3c)),
              title: const Text('Sair', style: TextStyle(color: Color(0xFFe74c3c))),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              onTap: () async {
                await AuthService.removeToken();
                if (context.mounted) context.go('/login');
              },
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _drawerItem(
      BuildContext context, IconData icon, String label, String route) {
    final current = GoRouterState.of(context).uri.toString();
    final isActive = current.startsWith(route);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      child: ListTile(
        leading: Icon(icon,
            color: isActive ? const Color(0xFFc9a84c) : const Color(0xFF7a8a7a)),
        title: Text(label,
            style: TextStyle(
                color: isActive ? const Color(0xFFe8e8e0) : const Color(0xFF7a8a7a),
                fontWeight: isActive ? FontWeight.w600 : FontWeight.normal)),
        selected: isActive,
        selectedTileColor: const Color(0xFF2d6a2d).withValues(alpha: 0.15),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        onTap: () {
          Navigator.pop(context);
          context.go(route);
        },
      ),
    );
  }
}
