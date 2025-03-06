const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();
const router = express.Router();
const cookieParser = require('cookie-parser');
const { check, validationResult } = require('express-validator');

router.use(cookieParser());
const JWT_SECRET = process.env.JWT_SECRET;

// Input validation middleware
const registerValidation = [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
];

const loginValidation = [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required').exists()
];

//----------------post request to register new users------------
router.post('/register', registerValidation, async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    try {
        // If user exists already
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists." });

        // Password hashing for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            email,
            password: hashedPassword,
        });
        
        // Save new user to database
        await newUser.save();
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '1h' });

        // Set secure cookie options
        const cookieOptions = {
            httpOnly: true,
            maxAge: 3600000, // 1 hour
            sameSite: 'Lax', // For cross-site protection, use 'None' for production with HTTPS
            secure: process.env.NODE_ENV === 'production', // Only use secure in production
        };

        res.cookie('token', token, cookieOptions);
        res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

//----------------post request to login users-----------------
router.post('/login', loginValidation, async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    try {
        // Find user by email
        const foundUser = await User.findOne({ email });
        if (!foundUser) return res.status(400).json({ message: "Invalid email/password" });
        
        // Compare passwords
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email/password" });
        
        // Create and sign JWT
        const token = jwt.sign({ userId: foundUser._id }, JWT_SECRET, { expiresIn: '1h' });

        // Update session information
        foundUser.sessionId = token;
        foundUser.sessionActive = true;
        await foundUser.save();

        // Set secure cookie options
        const cookieOptions = {
            httpOnly: true,
            maxAge: 3600000, // 1 hour
            sameSite: 'Lax', // For cross-site protection, use 'None' for production with HTTPS
            secure: process.env.NODE_ENV === 'production', // Only use secure in production
        };

        res.cookie('token', token, cookieOptions);
        res.status(200).json({ message: "Login successful!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
});

//----------------post request to logout users-----------------
router.post('/logout', async (req, res) => {
    try {
        // Get token from cookies
        const token = req.cookies.token;
        
        if (token) {
            // Verify token to get user ID
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                
                // Update user's session status
                await User.findByIdAndUpdate(decoded.userId, {
                    sessionActive: false,
                    sessionId: null
                });
            } catch (err) {
                // Token verification failed, but we still want to clear the cookie
                console.log("Invalid token during logout, clearing cookie anyway");
            }
        }
        
        // Clear cookie regardless of token validity
        res.clearCookie('token');
        res.status(200).json({ message: "Logout successful!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during logout." });
    }
});

// Check authentication status route
router.get('/status', async (req, res) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(200).json({ isAuthenticated: false });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user || !user.sessionActive) {
            return res.status(200).json({ isAuthenticated: false });
        }
        
        return res.status(200).json({ isAuthenticated: true });
    } catch (error) {
        return res.status(200).json({ isAuthenticated: false });
    }
});

module.exports = router;