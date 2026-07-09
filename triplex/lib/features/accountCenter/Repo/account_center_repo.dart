import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/core/api/dio_provider.dart';


part 'account_center_repo.g.dart';

@riverpod
AccountCenterRepo accountCenterRepo(Ref ref) {
  return AccountCenterRepo(ref.watch(dioProvider));
}

class AccountCenterRepo {
  
  final Dio _dio;
  
  AccountCenterRepo( this._dio );
  
  Future<String> changeUsername( String password,String newUsername ) async {
    try {
      final response = await _dio.put("profile/change-username",
        data: {
          "newUsername": newUsername,
          "password": password,
        },
      );

      return  response.data["newUsername"].toString();

    } on DioException catch (e) {
      final statusCode = e.response?.statusCode;
      if( statusCode == 400) {

        final message = e.response?.data["message"];

        if(message == "profile/change_username_invalid_password") {
          throw Exception("Wrong password");
        }
        if(message == "profile/change_username_username_taken") {
          throw Exception("Username is already taken");
        }
        throw Exception("Missing field");
      }
      throw Exception("Failed to change username");
    }
    catch (e) {

      if(kDebugMode) {
        print(e);
      }

      throw Exception("Unknown Error");
    }
  }

  Future<bool> isUsernameAvailable( String newUsername ) async {
    try {
      final response = await _dio.post("profile/check-username",
        data: {
          "username":newUsername
        }
      );

      if( response.data["available"] as bool == true) {
        return true;
      }

    } catch (e) {
      throw Exception("Unavailable");
    }

    return false;
  }
}