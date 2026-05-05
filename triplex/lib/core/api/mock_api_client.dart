import 'dart:async';
import '../api/api_client.dart';

class MockApiClient {
  MockApiClient({String baseUrl = 'https://api.example.com'}) : _baseUrl = baseUrl;

  final String _baseUrl;
  String? _authToken;
  final Map<String, Map<String, dynamic>> _users = {};
  final Map<String, Map<String, dynamic>> _profiles = {};
  final _authStateController = StreamController<String?>.broadcast();

  String get baseUrl => _baseUrl;
  String? get authToken => _authToken;
  Stream<String?> get authStateChanges => _authStateController.stream;

  void setAuthToken(String? token) {
    _authToken = token;
    _authStateController.add(token);
  }

  void clearAuthToken() {
    _authToken = null;
    _authStateController.add(null);
  }

  Future<ApiResponse> get(String endpoint, {Map<String, dynamic>? queryParams}) async {
    await Future.delayed(const Duration(milliseconds: 300));
    
    if (endpoint == '/auth/me' && _authToken != null) {
      final user = _users[_authToken];
      if (user != null) {
        return ApiResponse.success(user);
      }
    }
    
    if (endpoint.startsWith('/profiles/')) {
      final uid = endpoint.split('/profiles/')[1];
      final profile = _profiles[uid];
      if (profile != null) {
        return ApiResponse.success(profile);
      }
      return ApiResponse.failure(404, 'Profile not found');
    }
    
    return ApiResponse.failure(404, 'Endpoint not found');
  }

  Future<ApiResponse> post(String endpoint, {Map<String, dynamic>? body}) async {
    await Future.delayed(const Duration(milliseconds: 300));
    
    if (endpoint == '/auth/login') {
      final email = body?['email'] as String?;
      final password = body?['password'] as String?;
      
      if (email == 'demo@triplex.com' && password == 'password') {
        final uid = 'user_001';
        _authToken = uid;
        _users[uid] = {
          'uid': uid,
          'email': email,
          'displayName': 'Demo User',
          'photoUrl': null,
          'isEmailVerified': true,
        };
        _authStateController.add(uid);
        return ApiResponse.success({
          'uid': uid,
          'email': email,
          'displayName': 'Demo User',
          'photoUrl': null,
          'isEmailVerified': true,
          'token': uid,
        });
      }
      return ApiResponse.failure(401, 'Invalid credentials');
    }
    
    if (endpoint == '/profiles') {
      final uid = _authToken ?? 'user_001';
      final profile = {
        'uid': uid,
        'username': body?['username'] ?? 'user',
        'displayName': body?['displayName'] ?? 'User',
        'bio': body?['bio'],
        'avatarUrl': body?['avatarUrl'],
        'coverUrl': body?['coverUrl'],
        'followersCount': 0,
        'followingCount': 0,
        'postsCount': 0,
        'isVerified': false,
      };
      _profiles[uid] = profile;
      return ApiResponse.success(profile);
    }
    
    return ApiResponse.failure(404, 'Endpoint not found');
  }

  Future<ApiResponse> put(String endpoint, {Map<String, dynamic>? body}) async {
    await Future.delayed(const Duration(milliseconds: 300));
    
    if (endpoint.startsWith('/profiles/')) {
      final uid = endpoint.split('/profiles/')[1];
      final existing = _profiles[uid] ?? {'uid': uid};
      final updated = {...existing, ...?body};
      _profiles[uid] = updated;
      return ApiResponse.success(updated);
    }
    
    return ApiResponse.failure(404, 'Endpoint not found');
  }

  Future<ApiResponse> delete(String endpoint) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return ApiResponse.success({});
  }

  Future<void> logout() async {
    _authToken = null;
    _authStateController.add(null);
  }

  void dispose() {
    _authStateController.close();
  }
}
