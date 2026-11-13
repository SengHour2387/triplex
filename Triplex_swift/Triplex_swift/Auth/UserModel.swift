//
//  UserModel.swift
//  Triplex_swift
//

import Foundation

struct UserModel: Codable, Equatable {
    let id: String
    let username: String
    let email: String
    let name: String?
    let phone: String?
    let avatarUrl: String?
}

/// Helper struct for parsing responses that return { user: ... }
struct UserResponse: Codable {
    let user: UserModel
}

/// Helper struct for parsing responses that return { accessToken, refreshToken, user }
struct AuthResponse: Codable {
    let accessToken: String
    let refreshToken: String?
    let user: UserModel
}
