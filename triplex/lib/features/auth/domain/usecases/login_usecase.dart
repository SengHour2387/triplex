import '../../../../core/usecases/usecase.dart';
import '../../../../core/utils/typedefs.dart';
import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class LoginParams {
  const LoginParams({required this.email, required this.password});
  final String email;
  final String password;
}

class LoginUseCase implements UseCase<UserEntity, LoginParams> {
  const LoginUseCase(this._repository);
  final AuthRepository _repository;

  @override
  ResultFuture<UserEntity> call(LoginParams params) => _repository.login(
        email: params.email,
        password: params.password,
      );
}
