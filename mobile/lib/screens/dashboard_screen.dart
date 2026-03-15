import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../widgets/app_drawer.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List _sessions = [];
  List _rankings = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final results = await Future.wait([getSessions(), getRankings()]);
      setState(() {
        _sessions = results[0];
        _rankings = results[1];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final closed = _sessions.where((s) => s['status'] == 'closed').toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0a0e0a),
      appBar: AppBar(
        title: const Text('Dashboard'),
        backgroundColor: const Color(0xFF111611),
        foregroundColor: const Color(0xFFe8e8e0),
      ),
      drawer: const AppDrawer(),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFc9a84c)))
          : RefreshIndicator(
              color: const Color(0xFFc9a84c),
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _statsRow(),
                  const SizedBox(height: 24),
                  _leadersCard(),
                  const SizedBox(height: 24),
                  const Text('Histórico de Partidas',
                      style: TextStyle(
                          color: Color(0xFFe8e8e0),
                          fontSize: 18,
                          fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  if (closed.isEmpty)
                    const Center(
                        child: Text('Nenhuma partida finalizada',
                            style: TextStyle(color: Color(0xFF7a8a7a))))
                  else
                    ...closed.reversed.map((s) => _sessionCard(s)),
                ],
              ),
            ),
    );
  }

  Widget _statsRow() {
    final totalSessions = _sessions.length;
    final totalPlayers = _rankings.length;
    double totalPot = 0;
    for (final s in _sessions) {
      totalPot += (s['buy_in'] as num).toDouble();
    }

    return Row(
      children: [
        _statCard('Partidas', '$totalSessions', Icons.casino_outlined),
        const SizedBox(width: 12),
        _statCard('Jogadores', '$totalPlayers', Icons.people_outline),
        const SizedBox(width: 12),
        _statCard('Premiação', 'R\$ ${totalPot.toStringAsFixed(0)}', Icons.attach_money),
      ],
    );
  }

  Widget _statCard(String label, String value, IconData icon) => Expanded(
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF161d16),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF1f2e1f)),
          ),
          child: Column(
            children: [
              Icon(icon, color: const Color(0xFFc9a84c), size: 26),
              const SizedBox(height: 8),
              Text(value,
                  style: const TextStyle(
                      color: Color(0xFFe8e8e0),
                      fontSize: 18,
                      fontWeight: FontWeight.bold)),
              Text(label,
                  style: const TextStyle(color: Color(0xFF7a8a7a), fontSize: 11)),
            ],
          ),
        ),
      );

  Widget _leadersCard() {
    final top = List.from(_rankings)
      ..sort((a, b) => (b['total_profit'] as num).compareTo(a['total_profit'] as num));
    final colors = [
      const Color(0xFFc9a84c),
      const Color(0xFF9ca3af),
      const Color(0xFFb45309),
      const Color(0xFF1f2e1f),
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF161d16),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1f2e1f)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Líderes',
              style: TextStyle(
                  color: Color(0xFFe8e8e0),
                  fontSize: 16,
                  fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          if (top.isEmpty)
            const Text('Nenhuma partida ainda.',
                style: TextStyle(color: Color(0xFF7a8a7a), fontSize: 13))
          else
            ...top.take(4).toList().asMap().entries.map((entry) {
              final i = entry.key;
              final p = entry.value;
              final profit = (p['total_profit'] as num).toDouble();
              return Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  border: i < 3
                      ? const Border(bottom: BorderSide(color: Color(0xFF1f2e1f)))
                      : null,
                ),
                child: Row(
                  children: [
                    Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        color: colors[i],
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text('${i + 1}',
                            style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0a0e0a))),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Container(
                      width: 30,
                      height: 30,
                      decoration: BoxDecoration(
                        color: const Color(0xFF2d6a2d).withValues(alpha: 0.3),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                            (p['name'] as String)[0].toUpperCase(),
                            style: const TextStyle(
                                color: Color(0xFF3a8c3a),
                                fontWeight: FontWeight.bold,
                                fontSize: 13)),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(p['name'],
                          style: const TextStyle(color: Color(0xFFe8e8e0))),
                    ),
                    Text(
                        '${profit >= 0 ? '+' : ''}R\$ ${profit.toStringAsFixed(2)}',
                        style: TextStyle(
                            color: profit >= 0
                                ? const Color(0xFF3a8c3a)
                                : const Color(0xFFe74c3c),
                            fontWeight: FontWeight.bold,
                            fontSize: 13)),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _sessionCard(Map session) {
    final date = session['date'] ?? '';
    final buyIn = (session['buy_in'] as num).toDouble();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF161d16),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1f2e1f)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(date,
                style: const TextStyle(
                    color: Color(0xFFe8e8e0), fontWeight: FontWeight.bold)),
            Text('Buy-in: R\$ ${buyIn.toStringAsFixed(2)}',
                style: const TextStyle(color: Color(0xFF7a8a7a), fontSize: 13)),
          ]),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFF2d6a2d).withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF2d6a2d)),
            ),
            child: const Text('Finalizada',
                style: TextStyle(color: Color(0xFF3a8c3a), fontSize: 12)),
          )
        ],
      ),
    );
  }
}
