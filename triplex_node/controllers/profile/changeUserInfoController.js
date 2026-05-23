import pool from "../../db.js";
import bcrypt from "bcrypt";

export const changeUsernameController = async (req, res) => {

    const { id: userId } = req.user;
    const { newUsername, password } = req.body;

    if(!newUsername || !password) {
        return res.status(400).json({
            status: 'error',
            message: 'profile/change_username_missing_fields'
        });
    }

    try {

        const user = await pool.query('SELECT id, password FROM users WHERE id = $1', [userId]);
        if (!user.rows.length) {
            return res.status(404).json({
                status: 'error',
                message: 'profile/change_username_user_not_found'
            });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({
                status: 'error',
                message: 'profile/change_username_invalid_password'
            });
        }

        const result = await pool.query('SELECT id FROM users WHERE username = $1', [newUsername]);
        if (result.rows.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'profile/change_username_username_taken'
            });
        }

        await pool.query('UPDATE users SET username = $1 WHERE id = $2', [newUsername, userId]);

        res.status(200).json({
            status: 'success',
            message: 'profile/change_username_success',
            newUsername
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

    if(!newEmail || !password) {
        return res.status(400).json({
            status: 'error',
            message: 'profile/change_email_missing_fields'
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

        const result = await pool.query('SELECT id FROM users WHERE email = $1', [newEmail]);
        if (result.rows.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'profile/change_email_email_taken'
            });
        }

        await pool.query('UPDATE users SET email = $1 WHERE id = $2', [newEmail, userId]);

        res.status(200).json({
            status: 'success',
            message: 'profile/change_email_success',
            newEmail
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


