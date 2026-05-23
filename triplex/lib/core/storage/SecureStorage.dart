import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

part 'SecureStorage.g.dart';

@riverpod
class SecureStorage extends _$SecureStorage {
  @override
  FlutterSecureStorage build() {
    return FlutterSecureStorage();
  }

  Future<void> _write(String token,String key) async {
    await state.write(key: key, value: token);
  }

  Future<String?> _read(String key) async {
    return await state.read(key: key);
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

  Future<void> deleteAll() async {
    await state.deleteAll();
  }
}