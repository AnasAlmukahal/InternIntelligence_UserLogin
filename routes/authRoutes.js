const express = require('express');
const bcrypt= require('bcryptjs');
const jwt = require('jsonwebtoken');
const user= require('../models/user');
require('dotenv').config();
const router = express.Router();
const cookieParser = require('cookie-parser');

router.use(cookieParser());
const JWT_SECRET = process.env.JWT_SECRET;
//----------------post request to register new users------------
router.post('/register', async(req, res)=>{
    const{email, password} = req.body;
    try{
        //if user exists already
        const existingUser = await user.findOne({email});
        if(existingUser) return res.status(400).json({message:"user already exists."});
        
        //password hashing for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //create new user
        const newUser = new user({
            email,
            password: hashedPassword,
        });
        //save new user to database
        await newUser.save();
        const token = jwt.sign({userId: newUser._id},JWT_SECRET,{expiresIn:'1h'});

        res.cookie('token',token,{httpOnly:true});
        res.status(201).json({message:"user registerd successfully."});
    } catch(error){
        res.status(500).json({message:"server error"});
    }
});
//----------------post request to login users-----------------
router.post('/auth/login',async(req,res)=>{
    const {email,password}=req.body;
    try{
        const user=await user.findOne({email});
        if(!user) return res.status(400).json({message:"invalid email/passowrd"});
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({message:"invalid email/password"});
        const token = jwt.sign({userId:user._id},JWT_SECRET,{expiresIn:'1h'});

        res.cookie('token',token,{httpOnly:true});
        res.status(200).json({message:"Login success!"})
    } catch(error){
        res.status(500).json({message:"server error."});
    }
});
//----------------post request to logout users-----------------
router.post('/logout',(req,res)=>{
    res.clearCookie('token');
    res.status(200).json({message:"logout success!"});
});

module.exports=router;