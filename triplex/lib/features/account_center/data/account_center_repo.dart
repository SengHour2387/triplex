import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/core/api/dio_provider.dart';
import 'package:triplex/core/storage/secure_storage.dart';

part 'account_center_repo.g.dart';

@riverpod
AccountCenterRepo accountCenterRepo(Ref ref) {
  return AccountCenterRepo(
    ref.watch(dioProvider),
    ref.read(secureStorageProvider.notifier),
  );
}

class AccountCenterRepo {
  final Dio _dio;
  final SecureStorage _storage;

  AccountCenterRepo(this._dio, this._storage);

  Future<String> changeUsername(String newUsername) async {
    try {
      final response = await _dio.put(
        "profile/change-username",
        data: {
          "newUsername": newUsername,
        },
      );

      // Backend bumps token_version on change and returns fresh tokens
      // (the old refresh token is revoked). Persist them so the current
      // session stays valid.
      final accessToken = response.data["accessToken"] as String?;
      final refreshToken = response.data["refreshToken"] as String?;
      if (accessToken != null) await _storage.writeAccessToken(accessToken);
      if (refreshToken != null) await _storage.writeRefreshToken(refreshToken);

      return response.data["newUsername"].toString();
    } on DioException catch (e) {
      final statusCode = e.response?.statusCode;
      if (statusCode == 400) {
        final message = e.response?.data["message"];

        if (message == "profile/change_username_username_taken") {
          throw Exception("Username is already taken");
        }
        if (message == "profile/change_username_invalid_format") {
          throw Exception(
              "Username must be 3-30 letters, numbers, or underscores");
        }
        if (message == "profile/change_username_missing_fields") {
          throw Exception("Username cannot be empty");
        }
        throw Exception("Invalid username input");
      }
      throw Exception("Failed to change username");
    } catch (e) {
      if (kDebugMode) {
        print(e);
      }
      if (e is Exception) rethrow;
      throw Exception("Unknown error occurred");
    }
  }

  Future<String> changeEmail(String password, String newEmail) async {
    try {
      final response = await _dio.put(
        "profile/change-email",
        data: {
          "newEmail": newEmail,
          "password": password,
        },
      );

      // Backend bumps token_version on change and returns fresh tokens
      // (the old refresh token is revoked). Persist them so the current
      // session stays valid.
      final accessToken = response.data["accessToken"] as String?;
      final refreshToken = response.data["refreshToken"] as String?;
      if (accessToken != null) await _storage.writeAccessToken(accessToken);
      if (refreshToken != null) await _storage.writeRefreshToken(refreshToken);

      return response.data["newEmail"].toString();
    } on DioException catch (e) {
      final statusCode = e.response?.statusCode;
      if (statusCode == 400) {
        final message = e.response?.data["message"];

        if (message == "profile/change_email_invalid_password") {
          throw Exception("Incorrect password");
        }
        if (message == "profile/change_email_email_taken") {
          throw Exception("Email is already taken");
        }
        if (message == "profile/change_email_invalid_format") {
          throw Exception("Please enter a valid email address");
        }
        if (message == "profile/change_email_missing_fields") {
          throw Exception("Email and password cannot be empty");
        }
        throw Exception("Invalid email input");
      }
      if (statusCode == 404) {
        throw Exception("User not found");
      }
      throw Exception("Failed to change email");
    } catch (e) {
      if (kDebugMode) {
        print(e);
      }
      if (e is Exception) rethrow;
      throw Exception("Unknown error occurred");
    }
  }

  Future<bool> isUsernameAvailable(String newUsername) async {
    try {
      final response = await _dio.post(
        "profile/check-username",
        data: {
          "username": newUsername.trim(),
        },
      );

      if (response.data["available"] == true) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}
