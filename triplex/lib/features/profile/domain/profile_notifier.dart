import 'dart:convert';
import 'dart:io';

import 'package:image_picker/image_picker.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/core/media_optimizer/post_image_optimizer.dart';
import 'package:triplex/core/storage/secure_storage.dart';
import 'package:triplex/features/auth/domain/auth_notifier.dart';
import 'package:triplex/features/auth/domain/user_model.dart';
import 'package:triplex/features/profile/data/profile_repo.dart';
import 'package:triplex/features/profile/domain/upload_profile_picture_progress_notifier.dart';

part 'profile_notifier.g.dart';

@Riverpod(keepAlive: true)
class ProfileNotifier extends _$ProfileNotifier {
  @override
  FutureOr<UserModel?> build() {
    return ref.watch(authProvider).value;
  }

  Future<void> setProfilePicture({ImageSource? imageSource}) async {
    final pickedImage = await ImagePicker()
        .pickImage(source: imageSource ?? ImageSource.gallery);

    if (pickedImage != null) {
      final file = File(pickedImage.path);

      final compressImage = await PostImageOptimizer.optimizeForPost(file);

      final newUrl = await ref.watch(profileRepoProvider).setProfilePicture(
          compressImage ?? file, uploadCallback: (current, total) {
        print(current);
        ref
            .read(uploadProfilePictureProgressProvider.notifier)
            .update(((current / total) * 100).toInt());
      });

      final currentState = state.value;

      if (currentState != null && newUrl != null && newUrl.isNotEmpty) {
        state = AsyncData(currentState.copyWith(avatarUrl: newUrl));
        await _persist();
        ref.read(uploadProfilePictureProgressProvider.notifier).reset();
      }
    }
  }

  Future<void> _persist() async {
    final user = state.value;
    if (user != null) {
      await ref
          .read(secureStorageProvider.notifier)
          .writeUser(jsonEncode(user.toJson()));
    }
  }

  Future<void> setUsername(String username) async {
    final currentState = state.value;
    if (currentState != null) {
      state = AsyncData(currentState.copyWith(username: username));
      await _persist();
    }
  }

  Future<void> setUserEmail(String email) async {
    final currentState = state.value;
    if (currentState != null) {
      state = AsyncData(currentState.copyWith(email: email));
      await _persist();
    }
  }

  Future<void> setName(String name) async {
    final currentState = state.value;
    if (currentState != null) {
      state = AsyncData(currentState.copyWith(name: name));
      await _persist();
    }
  }

  Future<void> setUser(UserModel user) async {
    state = AsyncData(user);
  }

  Future<void> clearUser() async {
    state = const AsyncData(null);
  }
}

const profileNotifierProvider = profileProvider;
