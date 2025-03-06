const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const verifyToken = async (req, res, next) => {
    // Get token from cookie or authorization header
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user and check if session is active
        const user = await User.findById(decoded.userId);
        if (!user || !user.sessionActive || user.sessionId !== token) {
            return res.status(401).json({ message: "Session expired or invalid. Please login again." });
        }
        
        // Add user data to request
        req.user = {
            userId: decoded.userId,
            email: user.email
        };
        
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            res.status(401).json({ message: "Token expired. Please login again." });
        } else {
            res.status(401).json({ message: "Invalid token." });
        }
    }
};

module.exports = verifyToken;