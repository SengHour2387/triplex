import pool from "../../db.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../core/tokenGenerator.js";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const changeUsernameController = async (req, res) => {
    const { id: userId } = req.user;
    const { newUsername } = req.body;

    if (!newUsername || typeof newUsername !== 'string') {
        return res.status(400).json({
            status: 'error',
            message: 'profile/change_username_missing_fields'
        });
    }

    const trimmedUsername = newUsername.trim();

    if (!USERNAME_REGEX.test(trimmedUsername)) {
        return res.status(400).json({
            status: 'error',
            message: 'profile/change_username_invalid_format',
            details: 'Username must be between 3 and 30 characters and contain only letters, numbers, and underscores.'
        });
    }

    try {
        const result = await pool.query('SELECT id FROM users WHERE username = $1 AND id != $2', [trimmedUsername, userId]);
        if (result.rows.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'profile/change_username_username_taken'
            });
        }

        // Bump token_version so that any refresh tokens issued before this change
        // (e.g. on other devices) are rejected. We issue fresh tokens below so
        // the current session isn't logged out by its own change.
        const updateResult = await pool.query(
            'UPDATE users SET username = $1, token_version = token_version + 1, updated_at = NOW() WHERE id = $2 RETURNING id, username, email, name, phone, avatar_url, token_version',
            [trimmedUsername, userId]
        );
        const updatedUser = updateResult.rows[0];

        const accessToken = generateAccessToken(updatedUser);
        const refreshToken = generateRefreshToken(updatedUser);

        res.status(200).json({
            status: 'success',
            message: 'profile/change_username_success',
            newUsername: trimmedUsername,
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                name: updatedUser.name,
                phone: updatedUser.phone,
                avatar_url: updatedUser.avatar_url
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Error changing username:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to change username',
            error: error.message
        });
    }
}

export const changeEmailController = async (req, res) => {
    const { id: userId } = req.user;
    const { newEmail, password } = req.body;

    if (!newEmail || !password || typeof newEmail !== 'string') {
        return res.status(400).json({
            status: 'error',
            message: 'profile/change_email_missing_fields'
        });
    }

    const trimmedEmail = newEmail.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
        return res.status(400).json({
            status: 'error',
            message: 'profile/change_email_invalid_format',
            details: 'Please provide a valid email address.'
        });
    }

    try {
        const user = await pool.query('SELECT id, password FROM users WHERE id = $1', [userId]);
        if (!user.rows.length) {
            return res.status(404).json({
                status: 'error',
                message: 'profile/change_email_user_not_found'
            });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({
                status: 'error',
                message: 'profile/change_email_invalid_password'
            });
        }

        const result = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [trimmedEmail, userId]);
        if (result.rows.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'profile/change_email_email_taken'
            });
        }

        // Bump token_version so that any refresh tokens issued before this change
        // (e.g. on other devices) are rejected. We issue fresh tokens below so
        // the current session isn't logged out by its own change.
        const updateResult = await pool.query(
            'UPDATE users SET email = $1, token_version = token_version + 1, updated_at = NOW() WHERE id = $2 RETURNING id, username, email, name, phone, avatar_url, token_version',
            [trimmedEmail, userId]
        );
        const updatedUser = updateResult.rows[0];

        const accessToken = generateAccessToken(updatedUser);
        const refreshToken = generateRefreshToken(updatedUser);

        res.status(200).json({
            status: 'success',
            message: 'profile/change_email_success',
            newEmail: trimmedEmail,
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                name: updatedUser.name,
                phone: updatedUser.phone,
                avatar_url: updatedUser.avatar_url
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Error changing email:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to change email',
            error: error.message
        });
    }
}


