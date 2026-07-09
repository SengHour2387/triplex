import 'app_exception.dart';

class NetworkException extends AppException {
  NetworkException(super.message, [super.code]);

  factory NetworkException.noInternet() =>
      NetworkException("No internet connection", "NO_INTERNET");

  factory NetworkException.timeout() =>
      NetworkException("Connection timeout", "TIMEOUT");

  factory NetworkException.serverUnreachable() =>
      NetworkException("Cannot reach server", "SERVER_UNREACHABLE");
}