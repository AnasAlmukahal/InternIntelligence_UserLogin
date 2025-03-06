require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/user');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Ensure CORS middleware is applied correctly
// Try more permissive CORS configuration for debugging
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Debugging CORS - add middleware to inspect request
app.use((req, res, next) => {
    console.log(`Request from origin: ${req.headers.origin}`);
    console.log(`Request method: ${req.method}`);
    console.log(`Request path: ${req.path}`);
    next();
});

// Pre-flight OPTIONS handling (explicit handling to debug CORS)
app.options('*', cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security middleware - make sure to apply AFTER CORS
app.use(helmet({
    crossOriginResourcePolicy: false // Disable during debugging
}));
app.use(express.json({ limit: '10kb' }));

// Apply rate limiter AFTER CORS
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many login attempts, please try again later' }
});

app.use('/auth/login', loginLimiter);

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('mongoDB connected'))
    .catch(err => console.log(err));

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

app.listen(5000, () => {
    console.log('server running on http://localhost:5000');
});