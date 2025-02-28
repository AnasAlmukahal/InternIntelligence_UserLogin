require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
mongoose.connect(process.env.MONGO_URL)
.then(()=> console.log('mongoDB connected'))
.catch(err=>console.log(err));

app.use(express.json());
app.use('/auth', authRoutes);

app.listen(5000, ()=>{
    console.log('server running on https://localhost:5000');
});