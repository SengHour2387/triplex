import '../../../../core/usecases/usecase.dart';
import '../../../../core/utils/typedefs.dart';
import '../entities/profile_entity.dart';
import '../repositories/profile_repository.dart';

class GetProfileUseCase implements UseCase<ProfileEntity, String> {
  const GetProfileUseCase(this._repository);
  final ProfileRepository _repository;

  @override
  ResultFuture<ProfileEntity> call(String params) =>
      _repository.getProfile(params);
}
