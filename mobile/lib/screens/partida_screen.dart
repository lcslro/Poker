import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../widgets/app_drawer.dart';

class PartidaScreen extends StatefulWidget {
  const PartidaScreen({super.key});

  @override
  State<PartidaScreen> createState() => _PartidaScreenState();
}

class _PartidaScreenState extends State<PartidaScreen> {
  List _players = [];
  // ignore: unused_field
  List _sessions = [];
  Map? _activeSession;
  List _entries = [];
  bool _loading = true;

  String _date = DateFormat('yyyy-MM-dd').format(DateTime.now());
  double _buyIn = 10.0;
  final Set<int> _selectedPlayers = {};
  final _buyInCtrl = TextEditingController(text: '10');
  final Map<int, TextEditingController> _finalCtrls = {};

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

      final ctrls = <int, TextEditingController>{};
      for (final e in entries) {
        final finalAmt = (e['chips_end'] != null)
            ? ((e['chips_end'] as num).toDouble() * chipValue).toStringAsFixed(2)
            : '';
        ctrls[e['id']] = TextEditingController(text: finalAmt);
      }

      setState(() {
        _players = players;
        _sessions = sessions;
        _activeSession = active;
        _entries = entries;
        _finalCtrls.clear();
        _finalCtrls.addAll(ctrls);
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _createSession() async {
    if (_selectedPlayers.isEmpty) return;
    setState(() => _loading = true);
    try {
      final session = await createSession(_date, _buyIn);
      for (final playerId in _selectedPlayers) {
        await createEntry(session['id'], playerId, _buyIn / chipValue);
      }
      await _load();
    } catch (e) {
      setState(() => _loading = false);
      if (!mounted) return;
      _showError(e.toString());
    }
  }

  Future<void> _saveFinalAmount(int entryId) async {
    final ctrl = _finalCtrls[entryId];
    if (ctrl == null) return;
    final val = double.tryParse(ctrl.text);
    if (val == null) return;
    try {
      await updateEntry(entryId, val / chipValue);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Salvo!'), duration: Duration(seconds: 1)));
    } catch (e) {
      _showError(e.toString());
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(msg.replaceFirst('Exception: ', '')),
        backgroundColor: const Color(0xFFc0392b)));
  }

  String _playerName(int playerId) {
    final p = _players.firstWhere((p) => p['id'] == playerId,
        orElse: () => {'name': 'Desconhecido'});
    return p['name'];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0a0e0a),
      appBar: AppBar(
        title: const Text('Partida'),
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
                children: _activeSession == null
                    ? [_buildNewSessionForm()]
                    : [_buildActiveSession()],
              ),
            ),
    );
  }

  Widget _buildNewSessionForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _card(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Nova Partida',
                  style: TextStyle(
                      color: Color(0xFFe8e8e0),
                      fontSize: 18,
                      fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now(),
                    firstDate: DateTime(2020),
                    lastDate: DateTime(2030),
                    builder: (context, child) => Theme(
                      data: Theme.of(context).copyWith(
                        colorScheme: const ColorScheme.dark(
                          primary: Color(0xFF2d6a2d),
                          surface: Color(0xFF161d16),
                        ),
                      ),
                      child: child!,
                    ),
                  );
                  if (picked != null) {
                    setState(() => _date = DateFormat('yyyy-MM-dd').format(picked));
                  }
                },
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0a0e0a),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF1f2e1f)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(_date, style: const TextStyle(color: Color(0xFFe8e8e0))),
                      const Icon(Icons.calendar_today, color: Color(0xFF7a8a7a), size: 18),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _buyInCtrl,
                style: const TextStyle(color: Color(0xFFe8e8e0)),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: _inputDec('Buy-in padrão (R\$)'),
                onChanged: (v) => _buyIn = double.tryParse(v) ?? _buyIn,
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        _card(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Selecionar Jogadores',
                  style: TextStyle(
                      color: Color(0xFFe8e8e0),
                      fontSize: 16,
                      fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              ..._players.map((p) => CheckboxListTile(
                    title: Text(p['name'],
                        style: const TextStyle(color: Color(0xFFe8e8e0))),
                    value: _selectedPlayers.contains(p['id']),
                    activeColor: const Color(0xFF2d6a2d),
                    checkColor: const Color(0xFFe8e8e0),
                    side: const BorderSide(color: Color(0xFF1f2e1f)),
                    onChanged: (v) {
                      setState(() {
                        if (v == true) {
                          _selectedPlayers.add(p['id']);
                        } else {
                          _selectedPlayers.remove(p['id']);
                        }
                      });
                    },
                  )),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _selectedPlayers.isEmpty ? null : _createSession,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2d6a2d),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Iniciar Partida',
                style: TextStyle(color: Color(0xFFe8e8e0), fontSize: 16)),
          ),
        ),
      ],
    );
  }

  Widget _buildActiveSession() {
    final buyIn = (_activeSession!['buy_in'] as num).toDouble();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _card(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Partida em andamento',
                    style: TextStyle(
                        color: Color(0xFFe8e8e0), fontWeight: FontWeight.bold)),
                Text('Buy-in: R\$ ${buyIn.toStringAsFixed(2)}',
                    style: const TextStyle(color: Color(0xFF7a8a7a), fontSize: 13)),
                Text('Data: ${_activeSession!['date']}',
                    style: const TextStyle(color: Color(0xFF7a8a7a), fontSize: 13)),
              ]),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFc9a84c).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFc9a84c)),
                ),
                child: const Text('Em andamento',
                    style: TextStyle(color: Color(0xFFc9a84c), fontSize: 12)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        const Text('Resultados Finais',
            style: TextStyle(
                color: Color(0xFFe8e8e0),
                fontSize: 18,
                fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ..._entries.map((e) => _entryCard(e)),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () async {
              for (final e in _entries) {
                await _saveFinalAmount(e['id']);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2d6a2d),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Salvar Todos',
                style: TextStyle(color: Color(0xFFe8e8e0), fontSize: 16)),
          ),
        ),
      ],
    );
  }

  Widget _entryCard(Map entry) {
    final ctrl = _finalCtrls[entry['id']] ?? TextEditingController();

    return _card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Expanded(
            child: Text(_playerName(entry['player_id']),
                style: const TextStyle(
                    color: Color(0xFFe8e8e0), fontWeight: FontWeight.w500)),
          ),
          SizedBox(
            width: 120,
            child: TextField(
              controller: ctrl,
              style: const TextStyle(color: Color(0xFFe8e8e0)),
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: _inputDec('Final (R\$)'),
              onSubmitted: (_) => _saveFinalAmount(entry['id']),
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.check_circle_outline, color: Color(0xFF3a8c3a)),
            onPressed: () => _saveFinalAmount(entry['id']),
          ),
        ],
      ),
    );
  }

  Widget _card({required Widget child, EdgeInsets? margin}) => Container(
        margin: margin,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF161d16),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFF1f2e1f)),
        ),
        child: child,
      );

  InputDecoration _inputDec(String label) => InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Color(0xFF7a8a7a), fontSize: 13),
        filled: true,
        fillColor: const Color(0xFF0a0e0a),
        isDense: true,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFF1f2e1f))),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFF3a8c3a))),
      );
}
