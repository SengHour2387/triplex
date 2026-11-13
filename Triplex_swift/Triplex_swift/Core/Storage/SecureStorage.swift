//
//  SecureStorage.swift
//  Triplex_swift
//
//  Equivalent of: triplex/lib/core/storage/secure_storage.dart
//  Uses the native Keychain (Security framework) — no third-party dependency.
//

import Foundation
import Security

/// Wraps iOS Keychain access for token persistence.
/// Mirrors the key names used by the Flutter app for cross-platform consistency.
final class SecureStorage {

    // MARK: - Keys (mirror Flutter key names)

    private enum Key {
        static let accessToken  = "access_token_key"
        static let refreshToken = "refresh_token_key"
        static let user         = "user_key"
    }

    // MARK: - Public API

    func writeAccessToken(_ token: String)  throws { try write(token, for: Key.accessToken) }
    func writeRefreshToken(_ token: String) throws { try write(token, for: Key.refreshToken) }
    func writeUser(_ json: String)          throws { try write(json,  for: Key.user) }

    func getAccessToken()  -> String? { read(Key.accessToken) }
    func getRefreshToken() -> String? { read(Key.refreshToken) }
    func readUser()        -> String? { read(Key.user) }

    func deleteAll() {
        for key in [Key.accessToken, Key.refreshToken, Key.user] {
            delete(key)
        }
    }

    // MARK: - Private Keychain helpers

    private func write(_ value: String, for key: String) throws {
        guard let data = value.data(using: .utf8) else {
            throw SecureStorageError.encodingFailed
        }

        // Try to update an existing item first.
        let query = baseQuery(for: key)
        let status = SecItemUpdate(query as CFDictionary, [kSecValueData: data] as CFDictionary)

        if status == errSecItemNotFound {
            // Item doesn't exist yet — add it.
            var newItem = query
            newItem[kSecValueData as String] = data
            let addStatus = SecItemAdd(newItem as CFDictionary, nil)
            guard addStatus == errSecSuccess else {
                throw SecureStorageError.writeFailed(addStatus)
            }
        } else if status != errSecSuccess {
            throw SecureStorageError.writeFailed(status)
        }
    }

    private func read(_ key: String) -> String? {
        var query = baseQuery(for: key)
        query[kSecReturnData as String]  = kCFBooleanTrue
        query[kSecMatchLimit as String]  = kSecMatchLimitOne

        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        guard status == errSecSuccess, let data = item as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    private func delete(_ key: String) {
        SecItemDelete(baseQuery(for: key) as CFDictionary)
    }

    private func baseQuery(for key: String) -> [String: Any] {
        [
            kSecClass as String       : kSecClassGenericPassword,
            kSecAttrAccount as String : key,
            kSecAttrService as String : Bundle.main.bundleIdentifier ?? "com.triplex.app",
        ]
    }
}

// MARK: - Error

enum SecureStorageError: Error {
    case encodingFailed
    case writeFailed(OSStatus)
}
