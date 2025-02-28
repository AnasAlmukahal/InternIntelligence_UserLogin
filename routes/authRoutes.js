const express = require('express');
const bcrypt= require('bcryptjs');
const user= require('../models/user');
const router = express.Router();
//post request to register new users
router.post('/register', async(req, res)=>{
    const{email, password} = req.body;
    try{
        //if user exists already
        const existingUser = await user.findOne({email});
        if(existingUser) return res.status(400).json({message:"user already exists."});
        
        //password hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //create new user
        const newUser = new user({
            email,
            password: hashedPassword,
        });
        //save new user to database
        await newUser.save();
        res.status(201).json({message:"user registerd successfully."});
    } catch(error){
        res.status(500).json({message:"server error"});
    }
});
module.exports=router;