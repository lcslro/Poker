import 'dart:convert';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import 'auth_service.dart';

final String baseUrl = kIsWeb ? 'http://localhost:8000' : 'http://192.168.0.139:8000';
const double chipValue = 0.10;

Future<dynamic> apiFetch(String path,
    {String method = 'GET', Map<String, dynamic>? body}) async {
  final token = await AuthService.getToken();
  final headers = <String, String>{
    'Content-Type': 'application/json',
    if (token != null) 'Authorization': 'Bearer $token',
  };

  final uri = Uri.parse('$baseUrl$path');
  http.Response res;

  switch (method) {
    case 'POST':
      res = await http.post(uri, headers: headers,
          body: body != null ? jsonEncode(body) : null);
      break;
    case 'PUT':
      res = await http.put(uri, headers: headers,
          body: body != null ? jsonEncode(body) : null);
      break;
    case 'DELETE':
      res = await http.delete(uri, headers: headers);
      break;
    default:
      res = await http.get(uri, headers: headers);
  }

  if (res.statusCode == 401) {
    await AuthService.removeToken();
    throw Exception('Não autorizado');
  }
  if (res.statusCode == 204) return null;
  if (res.statusCode >= 400) {
    final err = jsonDecode(res.body);
    throw Exception(err['detail'] ?? 'Erro na requisição');
  }
  return jsonDecode(utf8.decode(res.bodyBytes));
}

Future<Map<String, dynamic>> login(String email, String password) async {
  final res = await http.post(
    Uri.parse('$baseUrl/auth/login'),
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: {'username': email, 'password': password},
  );
  if (res.statusCode != 200) {
    final err = jsonDecode(res.body);
    throw Exception(err['detail'] ?? 'Erro ao fazer login');
  }
  return jsonDecode(res.body);
}

Future<List> getPlayers() async => await apiFetch('/players/');
Future<List> getSessions() async => await apiFetch('/sessions/');
Future<List> getEntries(int sessionId) async =>
    await apiFetch('/entries/session/$sessionId');
Future<List> getRankings() async => await apiFetch('/rankings/');

Future<Map<String, dynamic>> createSession(String date, double buyIn) async =>
    await apiFetch('/sessions/', method: 'POST', body: {
      'date': date,
      'buy_in': buyIn,
      'chip_value': chipValue,
    });

Future<Map<String, dynamic>> updateSession(
        int id, Map<String, dynamic> data) async =>
    await apiFetch('/sessions/$id', method: 'PUT', body: data);

Future<Map<String, dynamic>> createEntry(
        int sessionId, int playerId, double chipsStart) async =>
    await apiFetch('/entries/', method: 'POST', body: {
      'session_id': sessionId,
      'player_id': playerId,
      'chips_start': chipsStart,
    });

Future<Map<String, dynamic>> updateEntry(int entryId, double chipsEnd) async =>
    await apiFetch('/entries/$entryId',
        method: 'PUT', body: {'chips_end': chipsEnd});

Future<dynamic> postSettle(int sessionId) async =>
    await apiFetch('/settle/$sessionId', method: 'POST');

Future<dynamic> getSettle(int sessionId) async =>
    await apiFetch('/settle/$sessionId');
