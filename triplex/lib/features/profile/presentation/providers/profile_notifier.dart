import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/profile_entity.dart';
import '../providers/profile_providers.dart';

class ProfileNotifier extends AsyncNotifier<ProfileEntity?> {
  @override
  Future<ProfileEntity?> build() async {
    // TODO: Replace uid with current auth user's uid
    // final uid = ref.watch(authNotifierProvider).value?.user?.uid;
    // if (uid == null) return null;
    // final result = await ref.read(getProfileUseCaseProvider)(uid);
    // return result.fold((_) => null, (p) => p);

    // ─── Mock data (remove once Firebase is configured) ───────────────────
    await Future.delayed(const Duration(milliseconds: 600));
    return const ProfileEntity(
      uid: 'mock-uid-001',
      username: 'alex.rivera',
      displayName: 'Alex Rivera',
      bio: 'Building the future, one frame at a time ✨\nPhotography • Travel • Design',
      followersCount: 24800,
      followingCount: 412,
      postsCount: 186,
      isVerified: true,
    );
  }

  Future<void> refresh(String uid) async {
    state = const AsyncLoading();
    final result = await ref.read(getProfileUseCaseProvider)(uid);
    state = result.fold(
      (failure) => AsyncError(failure.message, StackTrace.current),
      AsyncData.new,
    );
  }
}
