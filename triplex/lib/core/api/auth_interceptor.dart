import 'dart:async';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/core/api/auth_logout_signal.dart';
import 'package:triplex/core/config/app_config.dart';
import 'package:triplex/core/storage/secure_storage.dart';

part 'auth_interceptor.g.dart';

@Riverpod(keepAlive: true)
AuthInterceptor authInterceptor(Ref ref) {
  return AuthInterceptor(
    ref.watch(secureStorageProvider.notifier),
    AppConfig.baseUrl,
    onForceLogout: () {
      ref.read(authLogoutSignalProvider.notifier).trigger();
    },
  );
}

class AuthInterceptor extends Interceptor {
  final SecureStorage _storage;
  final void Function()? _onForceLogout;

  /// Dedicated Dio instance just for refresh calls — avoids recursive interception.
  final Dio _refreshDio;

  /// Mutex: prevents multiple simultaneous refresh calls.
  bool _isRefreshing = false;
  Completer<String?>? _refreshCompleter;

  AuthInterceptor(
    this._storage,
    String baseUrl, {
    void Function()? onForceLogout,
  })  : _onForceLogout = onForceLogout,
        _refreshDio = Dio(BaseOptions(baseUrl: baseUrl));

  dynamic _retryData(dynamic data) {
    if (data is FormData) {
      return data.clone();
    }
    return data;
  }

  Future<Response<dynamic>> _retryRequest(
    RequestOptions requestOptions,
    String accessToken,
  ) {
    final retryOptions = requestOptions.copyWith(
      data: _retryData(requestOptions.data),
      headers: Map<String, dynamic>.from(requestOptions.headers)
        ..['Authorization'] = 'Bearer $accessToken',
    );

    return _refreshDio.fetch(retryOptions);
  }

  void _completeRefresh(String? accessToken) {
    final completer = _refreshCompleter;
    if (completer != null && !completer.isCompleted) {
      completer.complete(accessToken);
    }
  }

  // ─── Attach token to every request ────────────────────────────────────────

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final accessToken = await _storage.getAccessToken();
    if (accessToken != null) {
      options.headers['Authorization'] = 'Bearer $accessToken';
    }
    handler.next(options);
  }

  // ─── Handle 401 / 403 with mutex refresh ──────────────────────────────────

  @override
  Future<void> onError(
      DioException err, ErrorInterceptorHandler handler) async {
    final isUnauthorized =
        err.response?.statusCode == 401 || err.response?.statusCode == 403;
    final isRefreshEndpoint = err.requestOptions.path.contains('auth/refresh');

    // Pass through non-auth errors and errors from the refresh endpoint itself.
    if (!isUnauthorized || isRefreshEndpoint) {
      return handler.next(err);
    }

    // ── Another request is already refreshing — queue behind it ──────────────
    if (_isRefreshing && _refreshCompleter != null) {
      final newToken = await _refreshCompleter!.future;
      if (newToken != null) {
        try {
          final retried = await _retryRequest(err.requestOptions, newToken);
          return handler.resolve(retried);
        } on DioException catch (e) {
          return handler.reject(e);
        }
      }
      return handler.reject(err);
    }

    // ── We are the first — acquire the mutex and refresh ─────────────────────
    _isRefreshing = true;
    _refreshCompleter = Completer<String?>();

    String? newAccessToken;

    try {
      final refreshToken = await _storage.getRefreshToken();
      if (refreshToken == null) throw Exception('No refresh token stored');

      final response = await _refreshDio.post(
        'auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      newAccessToken = response.data['accessToken'] as String?;
      final newRefreshToken = response.data['refreshToken'] as String?;

      if (newAccessToken == null) {
        throw Exception('No access token in response');
      }

      // Persist new tokens.
      await _storage.writeAccessToken(newAccessToken);
      if (newRefreshToken != null) {
        await _storage.writeRefreshToken(newRefreshToken);
      }

      // Unblock waiting requests.
      _completeRefresh(newAccessToken);
    } catch (e) {
      _completeRefresh(null);

      // Only wipe tokens if it's an actual auth failure,
      // not a connectivity issue.
      final isNetworkError = e is DioException &&
              (e.type == DioExceptionType.connectionError ||
                  e.type == DioExceptionType.connectionTimeout) ||
          e is SocketException;

      if (!isNetworkError) {
        await _storage.deleteAll();
        _onForceLogout?.call();
      }

      return handler.reject(err);
    } finally {
      _isRefreshing = false;
      // We don't nullify _refreshCompleter here immediately to avoid
      // late-arriving requests missing the future while we are still cleaning up.
      // But we must eventually.
    }

    // Retry the original failing request with the new token.
    try {
      final retried = await _retryRequest(err.requestOptions, newAccessToken);
      return handler.resolve(retried);
    } on DioException catch (e) {
      return handler.reject(e);
    }
  }
}
