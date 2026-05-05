import '../../../../core/api/mock_api_client.dart';
import '../../../../core/api/api_config.dart';
import '../../../../core/error/failure.dart';
import '../models/profile_model.dart';

abstract interface class ProfileRemoteDataSource {
  Future<ProfileModel> getProfile(String uid);
  Future<void> updateProfile(ProfileModel profile);
}

class ProfileRemoteDataSourceImpl implements ProfileRemoteDataSource {
  ProfileRemoteDataSourceImpl({MockApiClient? mockClient}) {
    _client = mockClient ?? MockApiClient(baseUrl: ApiConfig.baseUrl);
  }

  late final MockApiClient _client;

  @override
  Future<ProfileModel> getProfile(String uid) async {
    final response = await _client.get('/profiles/$uid');

    if (!response.isSuccess) {
      final statusCode = response.statusCode;
      if (statusCode == 404) {
        throw const ServerFailure('Profile not found');
      }
      throw ServerFailure(response.errorMessage ?? 'Failed to get profile');
    }

    return ProfileModel.fromJson(response.data ?? {});
  }

  @override
  Future<void> updateProfile(ProfileModel profile) async {
    final response = await _client.put('/profiles/${profile.uid}', body: profile.toJson());

    if (!response.isSuccess) {
      throw ServerFailure(response.errorMessage ?? 'Failed to update profile');
    }
  }
}