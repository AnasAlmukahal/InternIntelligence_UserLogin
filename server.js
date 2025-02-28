require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL)
.then(()=> console.log('mongoDB connected'))
.catch(err=>console.log(err));