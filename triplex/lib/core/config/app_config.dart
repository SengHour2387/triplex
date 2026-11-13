import 'dart:io';

class AppConfig {
  AppConfig._();
  static String get baseUrl {
    // Replace with your local IP address when testing on a real device
    // const host = "triplex-node.onrender.com";
    // const host = "192.168.1.9:3000";
    final host = Platform.isAndroid ? '10.0.2.2:3000' : 'localhost:3000';
    return 'http://$host/api/';
  }
}
