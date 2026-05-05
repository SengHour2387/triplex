import 'dart:async';
import '../../../../core/api/mock_api_client.dart';
import '../../../../core/api/api_config.dart';
import '../../../../core/error/failure.dart';
import '../models/user_model.dart';

abstract interface class AuthRemoteDataSource {
  Future<UserModel> login({required String email, required String password});
  Future<void> logout();
  Future<UserModel?> getCurrentUser();
  Stream<UserModel?> authStateChanges();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  AuthRemoteDataSourceImpl({MockApiClient? mockClient}) {
    _client = mockClient ?? MockApiClient(baseUrl: ApiConfig.baseUrl);
  }

  late final MockApiClient _client;

  @override
  Future<UserModel> login({
    required String email,
    required String password,
  }) async {
    final response = await _client.post('/auth/login', body: {
      'email': email,
      'password': password,
    });

    if (!response.isSuccess) {
      throw AuthFailure(response.errorMessage ?? 'Login failed');
    }

    final data = response.data;
    if (data == null) {
      throw const AuthFailure('Login returned no data');
    }

    _client.setAuthToken(data['token'] as String?);
    return UserModel.fromJson(data);
  }

  @override
  Future<void> logout() async {
    await _client.logout();
  }

  @override
  Future<UserModel?> getCurrentUser() async {
    if (_client.authToken == null) return null;

    final response = await _client.get('/auth/me');

    if (!response.isSuccess) {
      return null;
    }

    return UserModel.fromJson(response.data ?? {});
  }

  @override
  Stream<UserModel?> authStateChanges() {
    _authController.addStream(_client.authStateChanges.asyncMap((uid) async {
      if (uid == null) return null;
      return getCurrentUser();
    }));
    return _authController.stream;
  }

  final _authController = StreamController<UserModel?>.broadcast();
}