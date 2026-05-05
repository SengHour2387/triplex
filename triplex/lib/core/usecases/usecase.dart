import '../utils/typedefs.dart';

abstract interface class UseCase<ReturnType, Params> {
  ResultFuture<ReturnType> call(Params params);
}

class NoParams {
  const NoParams();
}
