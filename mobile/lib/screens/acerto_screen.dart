import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../widgets/app_drawer.dart';

class AcertoScreen extends StatefulWidget {
  const AcertoScreen({super.key});

  @override
  State<AcertoScreen> createState() => _AcertoScreenState();
}

class _AcertoScreenState extends State<AcertoScreen> {
  List _players = [];
  Map? _activeSession;
  List _entries = [];
  List _transfers = [];
  bool _loading = true;
  bool _settled = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final results = await Future.wait([getPlayers(), getSessions()]);
      final players = results[0];
      final sessions = results[1];

      Map? active;
      List entries = [];
      for (final s in sessions) {
        if (s['status'] == 'open') {
          active = s;
          entries = await getEntries(s['id']);
          break;
        }
      }

      setState(() {
        _players = players;
        _activeSession = active;
        _entries = entries;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _settle() async {
    if (_activeSession == null) return;
    setState(() => _loading = true);
    try {
      final result = await postSettle(_activeSession!['id']);
      setState(() {
        _transfers = result['transfers'] ?? [];
        _settled = true;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: const Color(0xFFc0392b)));
    }
  }

  String _playerName(int id) {
    final p = _players.firstWhere((p) => p['id'] == id,
        orElse: () => {'name': 'Desconhecido'});
    return p['name'];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0e0a),
      appBar: AppBar(
        title: const Text('Acerto'),
        backgroundColor: const Color(0xFF111611),
        foregroundColor: const Color(0xFFe8e8e0),
      ),
      drawer: const AppDrawer(),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFc9a84c)))
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (_activeSession == null)
                  const Center(
                      child: Text('Nenhuma partida em andamento',
                          style: TextStyle(color: Color(0xFF7a8a7a))))
                else ...[
                  _balancesCard(),
                  const SizedBox(height: 16),
                  if (!_settled)
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _settle,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFc9a84c),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8)),
                        ),
                        child: const Text('Calcular Acerto',
                            style: TextStyle(
                                color: Color(0xFF0a0e0a),
                                fontSize: 16,
                                fontWeight: FontWeight.bold)),
                      ),
                    )
                  else
                    _transfersCard(),
                ],
              ],
            ),
    );
  }

  Widget _balancesCard() {
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
          const Text('Saldos da Partida',
              style: TextStyle(
                  color: Color(0xFFe8e8e0),
                  fontSize: 18,
                  fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ..._entries.map((e) {
            final buyIn = (_activeSession!['buy_in'] as num).toDouble();
            final chipsEnd = e['chips_end'];
            final finalAmt = chipsEnd != null
                ? (chipsEnd as num).toDouble() * chipValue
                : null;
            final profit = finalAmt != null ? finalAmt - buyIn : null;

            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(_playerName(e['player_id']),
                      style: const TextStyle(color: Color(0xFFe8e8e0))),
                  if (profit != null)
                    Text(
                        '${profit >= 0 ? '+' : ''}R\$ ${profit.toStringAsFixed(2)}',
                        style: TextStyle(
                            color: profit >= 0
                                ? const Color(0xFF3a8c3a)
                                : const Color(0xFFe74c3c),
                            fontWeight: FontWeight.bold))
                  else
                    const Text('Pendente',
                        style: TextStyle(color: Color(0xFF7a8a7a))),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _transfersCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF161d16),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFc9a84c)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Transferências',
              style: TextStyle(
                  color: Color(0xFFe8e8e0),
                  fontSize: 18,
                  fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          if (_transfers.isEmpty)
            const Text('Nenhuma transferência necessária',
                style: TextStyle(color: Color(0xFF7a8a7a)))
          else
            ..._transfers.map((t) {
              final amount = (t['amount'] as num).toDouble();
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(_playerName(t['from_player_id']),
                          style: const TextStyle(color: Color(0xFFe74c3c))),
                    ),
                    const Icon(Icons.arrow_forward,
                        color: Color(0xFF7a8a7a), size: 16),
                    Expanded(
                      child: Text(_playerName(t['to_player_id']),
                          style: const TextStyle(color: Color(0xFF3a8c3a)),
                          textAlign: TextAlign.center),
                    ),
                    Text('R\$ ${amount.toStringAsFixed(2)}',
                        style: const TextStyle(
                            color: Color(0xFFc9a84c),
                            fontWeight: FontWeight.bold)),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }
}
