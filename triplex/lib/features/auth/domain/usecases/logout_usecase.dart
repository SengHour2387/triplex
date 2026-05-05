import '../../../../core/usecases/usecase.dart';
import '../../../../core/utils/typedefs.dart';
import '../repositories/auth_repository.dart';

class LogoutUseCase implements UseCase<void, NoParams> {
  const LogoutUseCase(this._repository);
  final AuthRepository _repository;

  @override
  ResultFuture<void> call(NoParams params) => _repository.logout();
}
