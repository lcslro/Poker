import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../widgets/app_drawer.dart';

class RankingScreen extends StatefulWidget {
  const RankingScreen({super.key});

  @override
  State<RankingScreen> createState() => _RankingScreenState();
}

class _RankingScreenState extends State<RankingScreen> {
  List _rankings = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await getRankings();
      setState(() {
        _rankings = data;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0e0a),
      appBar: AppBar(
        title: const Text('Ranking'),
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
                  if (_rankings.length >= 3) _podium(),
                  const SizedBox(height: 24),
                  _tableHeader(),
                  ..._rankings.asMap().entries.map((e) => _tableRow(e.key + 1, e.value)),
                ],
              ),
            ),
    );
  }

  Widget _podium() {
    final sorted = List.from(_rankings);
    sorted.sort((a, b) =>
        (b['total_profit'] as num).compareTo(a['total_profit'] as num));
    final first = sorted[0];
    final second = sorted[1];
    final third = sorted[2];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF161d16),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1f2e1f)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(child: _podiumItem(second, '2°', 80, const Color(0xFF9ca3af))),
          Expanded(child: _podiumItem(first, '1°', 110, const Color(0xFFc9a84c))),
          Expanded(child: _podiumItem(third, '3°', 60, const Color(0xFFb45309))),
        ],
      ),
    );
  }

  Widget _podiumItem(Map p, String pos, double height, Color color) {
    final profit = (p['total_profit'] as num).toDouble();
    return Column(
      children: [
        Text(p['name'] ?? '',
            style: const TextStyle(
                color: Color(0xFFe8e8e0),
                fontSize: 12,
                fontWeight: FontWeight.bold),
            textAlign: TextAlign.center),
        const SizedBox(height: 4),
        Text(
            '${profit >= 0 ? '+' : ''}R\$ ${profit.toStringAsFixed(2)}',
            style: TextStyle(
                color: profit >= 0 ? const Color(0xFF3a8c3a) : const Color(0xFFe74c3c),
                fontSize: 11),
            textAlign: TextAlign.center),
        const SizedBox(height: 8),
        Container(
          height: height,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
            border: Border.all(color: color),
          ),
          child: Center(
              child: Text(pos,
                  style: TextStyle(
                      color: color,
                      fontWeight: FontWeight.bold,
                      fontSize: 20))),
        ),
      ],
    );
  }

  Widget _tableHeader() => Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFF161d16),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
          border: Border.all(color: const Color(0xFF1f2e1f)),
        ),
        child: const Row(
          children: [
            SizedBox(width: 30, child: Text('#', style: TextStyle(color: Color(0xFF7a8a7a), fontSize: 12))),
            Expanded(child: Text('Jogador', style: TextStyle(color: Color(0xFF7a8a7a), fontSize: 12))),
            SizedBox(width: 50, child: Text('MVP', style: TextStyle(color: Color(0xFF7a8a7a), fontSize: 12), textAlign: TextAlign.center)),
            SizedBox(width: 60, child: Text('Win Rate', style: TextStyle(color: Color(0xFF7a8a7a), fontSize: 12), textAlign: TextAlign.center)),
            SizedBox(width: 70, child: Text('Lucro', style: TextStyle(color: Color(0xFF7a8a7a), fontSize: 12), textAlign: TextAlign.right)),
          ],
        ),
      );

  Widget _tableRow(int pos, Map p) {
    final profit = (p['total_profit'] as num).toDouble();
    final sessions = (p['sessions_played'] as num).toInt();
    final wins = (p['wins'] as num? ?? 0).toInt();
    final mvp = (p['mvp_count'] as num? ?? 0).toInt();
    final winRate = sessions > 0 ? (wins / sessions * 100).toStringAsFixed(0) : '0';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: pos % 2 == 0
            ? const Color(0xFF0a0e0a)
            : const Color(0xFF161d16).withValues(alpha: 0.5),
        border: const Border(bottom: BorderSide(color: Color(0xFF1f2e1f))),
      ),
      child: Row(
        children: [
          SizedBox(
              width: 30,
              child: Text('$pos',
                  style: const TextStyle(color: Color(0xFF7a8a7a), fontSize: 13))),
          Expanded(
              child: Text(p['name'] ?? '',
                  style: const TextStyle(
                      color: Color(0xFFe8e8e0), fontWeight: FontWeight.w500))),
          SizedBox(
              width: 50,
              child: Text('$mvp',
                  style: const TextStyle(color: Color(0xFFc9a84c)),
                  textAlign: TextAlign.center)),
          SizedBox(
              width: 60,
              child: Text('$winRate%',
                  style: const TextStyle(color: Color(0xFFe8e8e0)),
                  textAlign: TextAlign.center)),
          SizedBox(
              width: 70,
              child: Text(
                  '${profit >= 0 ? '+' : ''}R\$ ${profit.toStringAsFixed(2)}',
                  style: TextStyle(
                      color: profit >= 0
                          ? const Color(0xFF3a8c3a)
                          : const Color(0xFFe74c3c),
                      fontWeight: FontWeight.bold),
                  textAlign: TextAlign.right)),
        ],
      ),
    );
  }
}
