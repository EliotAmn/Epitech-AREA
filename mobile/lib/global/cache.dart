import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiSettingsStore {
  ApiSettingsStore._privateConstructor();
  static final ApiSettingsStore _instance =
      ApiSettingsStore._privateConstructor();
  factory ApiSettingsStore() => _instance;

  static const _apiUrlKey = 'api_url';
  final _secureStorage = const FlutterSecureStorage();
  final String _defaultApiUrl = dotenv.env['API_URL'] ?? '';

  Future<void> saveApiUrl(String apiUrl) async {
    await _secureStorage.write(key: _apiUrlKey, value: apiUrl);
  }

  Future<String?> loadApiUrl() async {
    String? apiUrl = await _secureStorage.read(key: _apiUrlKey);
    return (apiUrl != null && apiUrl.isNotEmpty) ? apiUrl : _defaultApiUrl;
  }
}

class AuthStore {
  AuthStore._privateConstructor();
  static final AuthStore _instance = AuthStore._privateConstructor();
  factory AuthStore() => _instance;

  static const _tokenKey = 'auth_token';
  final _secureStorage = const FlutterSecureStorage();

  Future<void> saveToken(String token) async {
    await _secureStorage.write(key: _tokenKey, value: token);
  }

  Future<String?> loadToken() async {
    return await _secureStorage.read(key: _tokenKey);
  }

  Future<void> clear() async {
    await _secureStorage.delete(key: _tokenKey);
  }
}
