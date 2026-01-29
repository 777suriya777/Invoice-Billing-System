import express from 'express';
import jsonwebtoken from 'jsonwebtoken';

// Authentication middleware
function authenticateUser(req, res, next) {
    // Accept either 'authorization' or 'Authorization' header
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const secret = process.env.JWT_SECRET || 'default_secret_key';
        const decoded = jsonwebtoken.verify(token, secret);

        // Attach the decoded payload to req for downstream handlers
        req.user = decoded;

        next();
    } catch (err) {
        return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
    }
}

export default authenticateUser;