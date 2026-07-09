import 'dart:io';

import 'package:image_picker/image_picker.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/core/mediaOptimizer/PostImageOptimizer.dart';
import 'package:triplex/features/auth/Domain/AuthNotifier.dart';
import 'package:triplex/features/auth/Domain/userModel.dart';
import 'package:triplex/features/profile/Domain/UploadProfilePictureProgressNotifier.dart';
import 'package:triplex/features/profile/Repo/ProfileRepo.dart';

part 'ProfileNotifier.g.dart';

@riverpod
class ProfileNotifier extends _$ProfileNotifier {

  @override
  FutureOr<UserModel?> build() {

    return ref.watch(authProvider).value;
  }

  Future<void> setProfilePicture( {ImageSource? imageSource }) async {
    final pickedImage = await ImagePicker().pickImage(source: imageSource?? ImageSource.gallery);



    if (pickedImage != null) {

      final file = File(pickedImage.path);

      final compressImage = await PostImageOptimizer.optimizeForPost(file);

        final newUrl = await ref.watch(profileRepoProvider).setProfilePicture(
            compressImage?? file,
          uploadCallback:(current,total) {
            print(current);
            ref.read(uploadProfilePictureProgressProvider.notifier).update(((current/total)*100).toInt());

          }
        );

        final currentState = state.value;

        if(currentState !=null && newUrl != null && newUrl.isNotEmpty) {

        state = AsyncData(UserModel(
          id: currentState.id, username: currentState.username, email: currentState.email, avatarUrl: newUrl,
        ));

        ref.read(uploadProfilePictureProgressProvider.notifier).reset();

        }
    }
  }

  Future<void> setUsername( String username ) async {

    final currentState = state.value;

    if (currentState != null) {
      state = AsyncData(UserModel(
        id: currentState.id, username: username, email: currentState.email, avatarUrl: currentState.avatarUrl,
      ));
    }

  }

  Future<void> setUser( UserModel user ) async {
    state = AsyncData(user);
  }

  Future<void> clearUser() async{
    state = AsyncData(null);
  }
}