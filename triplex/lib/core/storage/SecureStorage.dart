import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

part 'SecureStorage.g.dart';

final _storage = FlutterSecureStorage();

@riverpod
class SecureStorage extends _$SecureStorage {
  @override
  FlutterSecureStorage build() {
    return _storage;
  }

  Future<void> _write(String token, String key) async {
    await _storage.write(key: key, value: token);
  }

  Future<String?> _read(String key) async {
    return await _storage.read(key: key);
  }

  Future<void> writeAccessToken(String token) async {
    await _write(token, "access_token_key");
  }

  Future<void> writeRefreshToken(String token) async {
    await _write(token, "refresh_token_key");
  }

  Future<String?> getAccessToken() async {
    return await _read("access_token_key");
  }

  Future<String?> getRefreshToken() async {
    return await _read("refresh_token_key");
  }

  Future<void> writeUser(String userJson) async {
    await _write(userJson, "user_key");
  }

  Future<String?> readUser() async {
    return await _read("user_key");
  }

  Future<void> deleteAll() async {
    await _storage.deleteAll();
  }
}