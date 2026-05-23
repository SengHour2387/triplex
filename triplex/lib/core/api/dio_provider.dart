import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:triplex/core/api/Intercepter.dart';

part 'dio_provider.g.dart';

@riverpod
Dio dio(Ref ref) {
  // final String host = Platform.isAndroid ? '10.0.2.2' : 'localhost';
  // final String host = '172.20.53.35';
  final String host = "https://triplex-node.onrender.com";

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