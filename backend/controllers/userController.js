import express from 'express'
import User from '../models/userModel.js'
import bcrypt from 'bcrypt';
import Profile from '../models/profileModel.js'
import crypto from 'crypto'
import PDFDocument from 'pdfkit'
import fs from 'fs';
import ConnectionRequest from '../models/connectionModel.js'
import Job from '../models/jobModel.js'


const convertUserDataToPDF = async (userData) => {

    const doc = new PDFDocument();

    const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
    const stream = fs.createWriteStream("uploads/" + outputPath)

    doc.pipe(stream)

    doc.image(`/uploads/${userData.userId.profilePicture}`, { align: " center", width: 100 });
    doc.fontSize(14).text(`Name: ${userData.userId.name}`)
    doc.fontSize(14).text(`Username: ${userData.userId.username}`);
    doc.fontSize(14).text(`Email: ${userData.userId.email}`);
    doc.fontSize(14).text(`Bio: ${userData.userId.bio}`)
    doc.fontSize(14).text(`Current Position ${userData.currentPost}`)
    doc.fontSize(14).text("Past Work")
    userData.pastWork.forEach((work, index) => {
        doc.fontSize(14).text(`Company Name: ${work.company}`)
        doc.fontSize(14).text(`Position: ${work.position} `)
        doc.fontSize(14).text(`years ${work.years}`)
    })

    doc.end()

    return outputPath;

}

export const register = async (req, res) => {
    try {
        const { name, email, password, username } = req.body;
        if (!name || !email || !password || !username) return res.status(400).json({ message: "all fields are required" })

        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "user already exist" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const token = crypto.randomBytes(32).toString("hex");

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username,
            token
        })

        await newUser.save();

        const profile = new Profile({ userId: newUser._id });

        await profile.save();
        return res.json({
            token,
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                profilePicture: newUser.profilePicture,
            }
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ mesage: "All fields are required" })

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User does not exist" })

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(400).json({ message: "invalid credentials" })

        const token = crypto.randomBytes(32).toString("hex")
        await User.updateOne({ _id: user._id }, { token })

        const responseData = {
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                profilePicture: user.profilePicture,
            }
        };
        return res.json(responseData)

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const uploadProfilePicture = async (req, res) => {
    const { token } = req.body;

    try {
        const user = await User.findOne({ token: token })
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }

        user.profilePicture = req.file.path;
        await user.save();

        return res.json({
            message: "profile picture updated",
            profilePicture: req.file.path,
        });

    } catch (error) {
        res.status(500).json({ message: error.mesage })
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        const { token, ...newUserData } = req.body;

        const user = await User.findOne({ token: token });

        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        const { username, email } = newUserData;
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser && String(existingUser._id) !== String(user._id)) {
            return res.status(400).json({ message: "user already exists" });
        }
        Object.assign(user, newUserData);
        await user.save();
        return res.json({ message: "user updated" });
    } catch (error) {
        return res.status(500).json({ message: error.mesage })
    }
}

export const getUserAndProfile = async (req, res) => {
    try {
        const token = req.body?.token || req.query.token || req.headers['x-auth-token'];

        const user = await User.findOne({ token: token });

        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        let userProfile = await Profile.findOne({ userId: user._id }).populate('userId', 'name email username profilePicture');

        if (!userProfile) {
            const newProfile = new Profile({ userId: user._id });
            await newProfile.save();
            userProfile = await Profile.findOne({ userId: user._id }).populate('userId', 'name email username profilePicture');
        }

        return res.json(userProfile);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const updateProfileData = async (req, res) => {
    try {
        const { token, ...newProfileData } = req.body;
        const userProfile = await User.findOne({ token: token });

        if (!userProfile) {
            return res.status(400).json({ message: "user not found" })
        }

        const profile_to_update = await Profile.findOne({ userId: userProfile._id });
        Object.assign(profile_to_update, newProfileData);

        await profile_to_update.save();

        return res.json({ message: "profile updated" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getAllUserProfile = async (req, res) => {
    try {
        const profiles = await Profile.find().populate('userId', 'name username email profilePicture')

        return res.json({ profiles })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const downloadProfile = async (req, res) => {
    try {
        const user_id = req.query.id;
        const userProfile = await Profile.findOne({ userId: user_id }).populate('userId', 'name username email profilePicture')
        let outputPath = await convertUserDataToPDF(userProfile);

        return res.json({ message: outputPath })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


export const sendConnectionRequest = async (req, res) => {
    const { token, connectionId } = req.body;

    try {
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        const connectionUser = await User.findOne({ _id: connectionId });

        if (!connectionUser) {
            return res.status(404).json({ message: "connection user not found" });
        }
        const existingRequest = await ConnectionRequest.findOne({
            userId: user._id,
            connectionId: connectionUser._id
        })
        if (existingRequest) {
            return res.status(400).json({ message: "request already sent" })
        }

        const request = new ConnectionRequest({
            userId: user._id,
            connectionId: connectionUser._id
        })

        await request.save();
        return res.json({ message: "request sent" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const getMyConnectionRequests = async (req, res) => {
    const token = req.body?.token || req.query.token || req.headers['x-auth-token'];

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: " user not found" })
        }

        const connections = await ConnectionRequest.find({ userId: user._id }).populate('connectionId', 'name username email profilePicture');

        return res.json({ connections })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


export const whatAreMyConnection = async (req, res) => {
    const token = req.body?.token || req.query.token || req.headers['x-auth-token'];
    try {
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(404).json({ mesage: "user not found" })
        }

        const connections = await ConnectionRequest.find({ connectionId: user._id }).populate('userId', 'name username email profilePicture')
        return res.json(connections)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const acceptConnectionRequest = async (req, res) => {
    const { token, requestId, action_type } = req.body;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ mesage: "user not found" })
        }

        const connection = await ConnectionRequest.findOne({ _id: requestId })

        if (!connection) {
            return res.status(404).json({ message: "connection not found" })
        }

        if (action_type === "accept") {
            connection.status_accepted = true;
        } else {
            connection.status_accepted = false;
        }

        await connection.save();
        return res.json({ message: "request updated" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const changePassword = async (req, res) => {
    const { token, currentPassword, newPassword } = req.body;
    try {
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.json({ message: "Password updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteUserAccount = async (req, res) => {
    const { token } = req.body;
    try {
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Delete profile
        await Profile.deleteOne({ userId: user._id });

        // Delete connection requests
        await ConnectionRequest.deleteMany({
            $or: [{ userId: user._id }, { connectionId: user._id }]
        });

        // Delete user's posts
        await Post.deleteMany({ userId: user._id });

        // Delete user's comments
        await Comment.deleteMany({ userId: user._id });

        // Delete user's created jobs
        await Job.deleteMany({ postedBy: user._id });

        // Remove user from applicants list in other jobs
        await Job.updateMany(
            { applicants: user._id },
            { $pull: { applicants: user._id } }
        );

        // Delete user
        await User.deleteOne({ _id: user._id });

        return res.json({ message: "Account deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};