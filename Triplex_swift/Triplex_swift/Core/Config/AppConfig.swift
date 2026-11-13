//
//  AppConfig.swift
//  Triplex_swift
//
//  Equivalent of: triplex/lib/core/config/app_config.dart
//

import Foundation

enum AppConfig {
    /// Base URL for all API calls.
    /// Swap to your Render deployment URL for production:
    ///   static let baseURL = URL(string: "https://triplex-node.onrender.com/api/")!
    static let baseURL: URL = URL(string: "http://10.66.44.35:3000/api/")!

    static let connectTimeout: TimeInterval = 10
    static let receiveTimeout: TimeInterval = 15
}
