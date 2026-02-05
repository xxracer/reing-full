
const { pool } = require('./backend/db');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function fixUser() {
    try {
        const username = 'moon';
        const password = 'reingrules'; // The password we want

        console.log(`Checking user: ${username}...`);
        const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        const hash = await bcrypt.hash(password, 10);

        if (res.rows.length === 0) {
            console.log('User not found. Creating...');
            await pool.query(
                'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
                [username, hash]
            );
            console.log('User created.');
        } else {
            console.log('User found. Resetting password...');
            await pool.query(
                'UPDATE users SET password_hash = $1 WHERE username = $2',
                [hash, username]
            );
            console.log('Password updated.');
        }

        // Verify
        const verify = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        console.log('User in DB:', verify.rows[0].username);
        console.log('Success! Credentials are: moon / reingrules');
        process.exit(0);

    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

fixUser();
