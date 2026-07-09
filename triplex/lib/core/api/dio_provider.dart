import 'package:dio/dio.dart';
import 'package:triplex/core/api/Intercepter.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'dio_provider.g.dart';

@riverpod
Dio dio(Ref ref) {
  // final String host = "http://${Platform.isAndroid ? '10.0.2.2:3000' : 'localhost:3000'}";

  // final String host = '172.20.53.35';
  final String host = "https://triplex-node-1byl.onrender.com";

  final dio = Dio(
    BaseOptions(
      baseUrl: '$host/api/',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      sendTimeout: const Duration(seconds: 10),
      contentType: 'application/json',
    ),
  );
  dio.interceptors.add(ref.watch(authInterceptorProvider));
  return dio;
}