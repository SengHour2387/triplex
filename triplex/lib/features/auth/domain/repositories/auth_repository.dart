import '../../../../core/utils/typedefs.dart';
import '../entities/user_entity.dart';

abstract interface class AuthRepository {
  ResultFuture<UserEntity> login({
    required String email,
    required String password,
  });
  ResultFuture<void> logout();
  ResultFuture<UserEntity?> getCurrentUser();
  ResultStream<UserEntity?> authStateChanges();
}
