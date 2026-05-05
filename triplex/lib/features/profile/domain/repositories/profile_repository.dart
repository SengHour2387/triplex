import '../../../../core/utils/typedefs.dart';
import '../entities/profile_entity.dart';

abstract interface class ProfileRepository {
  ResultFuture<ProfileEntity> getProfile(String uid);
  ResultFuture<void> updateProfile(ProfileEntity profile);
}
