require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/user');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Enhanced CORS configuration
app.use(cors({
    origin: 'http://localhost:5500', 
    credentials: true
}));

// Security middleware
app.use(helmet()); 
app.use(express.json({ limit: '10kb' })); 


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { message: 'Too many login attempts, please try again later' }
});

// Apply rate limiter only to login endpoint
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