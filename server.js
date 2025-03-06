require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const app = express();
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');


app.use(cors({
    origin: 'http://localhost:5500',   
    credentials: true                  
}));

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('mongoDB connected'))
    .catch(err => console.log(err));

app.use(express.json());
app.use('/auth', authRoutes);

app.listen(5000, () => {
    console.log('server running on http://localhost:5000');
});
