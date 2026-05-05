import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiClient {
  ApiClient({
    required String baseUrl,
    http.Client? client,
    Map<String, String>? headers,
  })  : _baseUrl = baseUrl,
        _client = client ?? http.Client(),
        _defaultHeaders = headers ?? {'Content-Type': 'application/json'};

  final String _baseUrl;
  final http.Client _client;
  final Map<String, String> _defaultHeaders;

  Map<String, String> get headers => Map.from(_defaultHeaders);

  void setAuthToken(String token) {
    _defaultHeaders['Authorization'] = 'Bearer $token';
  }

  void clearAuthToken() {
    _defaultHeaders.remove('Authorization');
  }

  Uri _buildUri(String endpoint, [Map<String, dynamic>? queryParams]) {
    final uri = Uri.parse('$_baseUrl$endpoint');
    if (queryParams != null && queryParams.isNotEmpty) {
      return uri.replace(queryParameters: queryParams.map(
        (key, value) => MapEntry(key, value.toString()),
      ));
    }
    return uri;
  }

  Future<ApiResponse> get(
    String endpoint, {
    Map<String, dynamic>? queryParams,
    Map<String, String>? headers,
  }) async {
    try {
      final response = await _client.get(
        _buildUri(endpoint, queryParams),
        headers: {..._defaultHeaders, ...?headers},
      );
      return _handleResponse(response);
    } catch (e) {
      return ApiResponse.error(e.toString());
    }
  }

  Future<ApiResponse> post(
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    try {
      final response = await _client.post(
        _buildUri(endpoint),
        headers: {..._defaultHeaders, ...?headers},
        body: body != null ? jsonEncode(body) : null,
      );
      return _handleResponse(response);
    } catch (e) {
      return ApiResponse.error(e.toString());
    }
  }

  Future<ApiResponse> put(
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    try {
      final response = await _client.put(
        _buildUri(endpoint),
        headers: {..._defaultHeaders, ...?headers},
        body: body != null ? jsonEncode(body) : null,
      );
      return _handleResponse(response);
    } catch (e) {
      return ApiResponse.error(e.toString());
    }
  }

  Future<ApiResponse> delete(
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    try {
      final response = await _client.delete(
        _buildUri(endpoint),
        headers: {..._defaultHeaders, ...?headers},
        body: body != null ? jsonEncode(body) : null,
      );
      return _handleResponse(response);
    } catch (e) {
      return ApiResponse.error(e.toString());
    }
  }

  ApiResponse _handleResponse(http.Response response) {
    final statusCode = response.statusCode;
    final body = response.body.isNotEmpty
        ? jsonDecode(response.body) as Map<String, dynamic>
        : <String, dynamic>{};

    if (statusCode >= 200 && statusCode < 300) {
      return ApiResponse.success(body);
    } else {
      final message = body['message'] as String? ?? 'Unknown error';
      return ApiResponse.failure(statusCode, message);
    }
  }
}

class ApiResponse {
  ApiResponse._({
    required this.isSuccess,
    this.data,
    this.errorMessage,
    this.statusCode,
  });

  factory ApiResponse.success(Map<String, dynamic> data) => ApiResponse._(
        isSuccess: true,
        data: data,
      );

  factory ApiResponse.failure(int statusCode, String message) =>
      ApiResponse._(
        isSuccess: false,
        statusCode: statusCode,
        errorMessage: message,
      );

  factory ApiResponse.error(String message) => ApiResponse._(
        isSuccess: false,
        errorMessage: message,
      );

  final bool isSuccess;
  final Map<String, dynamic>? data;
  final String? errorMessage;
  final int? statusCode;

  Map<String, dynamic>? get dataOrNull => data;
}
