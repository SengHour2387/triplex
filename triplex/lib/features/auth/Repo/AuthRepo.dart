import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:triplex/core/api/dio_provider.dart';
import 'package:triplex/core/storage/SecureStorage.dart';
import 'package:triplex/features/auth/Domain/userModel.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
part 'AuthRepo.g.dart';

@riverpod
AuthRepo authRepo(Ref ref) {
  return AuthRepo(
    ref.watch(dioProvider),
    ref.read(secureStorageProvider.notifier),
  );
}

class AuthRepo {
  final Dio _dio;
  final SecureStorage _storage;
  AuthRepo(this._dio, this._storage);

  Future<UserModel> login(String email, String password) async {
    try {
      final endpoint = email.contains('@') ? 'auth/login' : 'auth/login-username';
      final field = email.contains('@') ? 'email' : 'username';
      final response = await _dio.post(
        endpoint,
        data: {field: email, 'password': password},
      );

      // Save tokens to secure storage
      final accessToken = response.data['accessToken'] as String?;
      final refreshToken = response.data['refreshToken'] as String?;
      if (accessToken != null) await _storage.writeAccessToken(accessToken);
      if (refreshToken != null) await _storage.writeRefreshToken(refreshToken);

      return UserModel.fromJson(response.data['user']);
    } on DioException catch (e) {
      if (e.response?.statusCode == 400 || e.response?.statusCode == 401) {
        throw Exception('Invalid email or password');
      } else {
        throw Exception('Failed to login: $e');
      }
    } catch (e) {
      throw Exception('Failed to login: $e');
    }
  }

  Future<UserModel> register(
    String email,
    String username,
    String password,
  ) async {
    try {
      final response = await _dio.post(
        'auth/register',
        data: {'email': email, 'username': username, 'password': password},
      );

      // Save tokens to secure storage
      final accessToken = response.data['accessToken'] as String?;
      final refreshToken = response.data['refreshToken'] as String?;
      if (accessToken != null) await _storage.writeAccessToken(accessToken);
      if (refreshToken != null) await _storage.writeRefreshToken(refreshToken);

      return UserModel.fromJson(response.data['user']);
    } on DioException catch (e) {
      if (e.response?.statusCode == 400) {
        if(e.response?.data["message"] == "auth/register_missing_fields") {
          throw Exception('Missing fields');
        } else if(e.response?.data["message"] == "auth/register_empty_fields" ) {
          throw Exception('Empty fields');
        } else {
          throw Exception('Bad input');
        }
      } else {
        throw Exception('Failed to register');
      }
    } catch (e) {
      throw Exception('Failed to register');
    }
  }



  Future<UserModel?> getMe( String token) async {
    try {
      final response = await _dio.get("profile/me");
      return UserModel.fromJson(response.data['user']);
    } on DioException catch (e) {
      if (e.response?.statusCode == 400 || e.response?.statusCode == 401 || e.response?.statusCode == 403) {
        throw Exception('Invalid token');
      } else {
        throw Exception('Failed to fetch profile: $e');
      }
    } catch (e) {
      throw Exception('Failed to fetch profile: $e');
    }
  }

  Future<UserModel?> refresh( String token ) async {
    try {
      final response = await _dio.post(
          "auth/refresh",
        data: { "refreshToken":token}
      );
      return UserModel.fromJson(response.data['user']);
    } on DioException catch (e) {
      if (e.response?.statusCode == 400 || e.response?.statusCode == 401 || e.response?.statusCode == 403) {
        throw Exception('Invalid token');
      } else {
        throw Exception('Failed to fetch new token: $e');
      }
    } catch (e) {
      throw Exception('Failed to fetch new token: $e');
    }
  }

  /// Calls auth/refresh, saves both new tokens, and returns the user.
  Future<UserModel?> refreshAndSave(String refreshToken) async {
    try {
      final response = await _dio.post(
        "auth/refresh",
        data: {"refreshToken": refreshToken},
      );

      final newAccessToken = response.data['accessToken'] as String?;
      final newRefreshToken = response.data['refreshToken'] as String?;

      if (newAccessToken == null) throw Exception('No access token returned');

      await _storage.writeAccessToken(newAccessToken);
      if (newRefreshToken != null) await _storage.writeRefreshToken(newRefreshToken);

      return UserModel.fromJson(response.data['user']);
    } on DioException catch (e) {
      if (e.response?.statusCode == 400 ||
          e.response?.statusCode == 401 ||
          e.response?.statusCode == 403) {
        throw Exception('Refresh token invalid or expired');
      } else {
        throw Exception('Failed to refresh token: $e');
      }
    } catch (e) {
      throw Exception('Failed to refresh token: $e');
    }
  }

}
