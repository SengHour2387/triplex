
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/core/api/dio_provider.dart';
import 'package:triplex/features/auth/Domain/userModel.dart';

part 'ProfileRepo.g.dart';

@riverpod
ProfileRepo profileRepo(Ref ref ) {
  return ProfileRepo(dio: ref.watch(dioProvider));
}


class ProfileRepo {
  final Dio dio;
  ProfileRepo( {required this.dio} );

  Future<String?> setProfilePicture( File file ,{ ProgressCallback? uploadCallback })  async {

    final formData = FormData.fromMap({
      'image': await MultipartFile.fromFile(
        file.path,
        filename: file.path.split('/').last,
      ),
    });

    try {
      final response = await dio.post(
          '/profile/profile-picture',
          data: formData,
        onSendProgress: uploadCallback
      );

     if(response.statusCode == 200) {
       return response.data["avatarUrl"];
     } else {
       return null;
     }

    } on DioException catch (e){
      throw Exception(e.response?.data["message"]);
    }
    catch (e){
      throw Exception("Setting profile picture error");
    }
  }
}