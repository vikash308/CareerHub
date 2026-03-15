import express from 'express'
import User from '../models/userModel.js'
import bcrypt from 'bcrypt';
import Profile from '../models/profileModel.js'
import crypto from 'crypto'

export const register = async (req,res) => {
    try {
        const { name, email, password, username } = req.body;
        if (!name || !email || !password || !username) return res.status(400).json({ message: "all fields are required" })

        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "user already exist" });
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username
        })

        await newUser.save();

        const profile = new Profile({ userId: newUser._id });
        return res.json({ message: "user registered successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const login =async (req,res)=>{
    try {
        const {email , password} = req.body;
        if(!email || !password) return res.status(400).json({mesage: "All fields are required"})

        const user = await User.findOne({email});
        if(!user) return res.status(404).json({message: "user does not exist"})

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) return res.status(400).json({message:"invalid credentials"})

        const token = crypto.randomBytes(32).toString("hex")
        await User.updateOne({_id : user._id}, {token})

        return res.json({token})

    } catch (error) {
        return res.status(500).json({ message: err.message });
    }
}