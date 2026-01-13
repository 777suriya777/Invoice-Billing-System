const store = require('./memory-store');
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function generateAccessToken(email) {
    const secret = process.env.JWT_SECRET || 'default_secret_key';
    const payload = {
        sub: email,
        email: email,
        role: 'user'
    };
    const options = { expiresIn: '15m', issuer: 'invoice-billing-system' };

    return jsonwebtoken.sign(payload, secret, options);
}

function LoginUser(req, res) {
    const {email, password} = req.body;
    if (!email || !password) { 
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const storedHashedPassword = store.get(email);
    if (!storedHashedPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    try {
        const passwordMatch = bcrypt.compareSync(password, storedHashedPassword);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const accessToken = generateAccessToken(email);
        return res.status(200).json({ message: 'Login successful', accessToken });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

function RegisterUser(req, res) {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        if (store.has(email)) {
        return res.status(409).json({ message: 'User already exists' });
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        store.set(email, hashedPassword);
        const accessToken = generateAccessToken(email);
        return res.status(201).json({ message: 'User registered successfully', accessToken });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { RegisterUser, LoginUser };

