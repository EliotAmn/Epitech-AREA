import 'package:flutter_secure_storage/flutter_secure_storage.dart';

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
