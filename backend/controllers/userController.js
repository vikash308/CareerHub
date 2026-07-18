import express from 'express'
import User from '../models/userModel.js'
import bcrypt from 'bcrypt';
import Profile from '../models/profileModel.js'
import crypto from 'crypto'
import PDFDocument from 'pdfkit'
import fs from 'fs';
import pdfParse from 'pdf-parse';
import ConnectionRequest from '../models/connectionModel.js'
import Job from '../models/jobModel.js'
import { createNotification } from './notificationController.js';


const convertUserDataToPDF = async (userData, res) => {
    // Enable page buffering to allow writing footers like "Page X of Y" after generation
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });

    // Pipe the PDF document directly to the response object
    doc.pipe(res);

    // Profile picture handling: download from Cloudinary if it's a URL
    let imageBuffer = null;
    if (userData.userId && userData.userId.profilePicture) {
        const pic = userData.userId.profilePicture;
        if (pic.startsWith('http://') || pic.startsWith('https://')) {
            try {
                const imgRes = await fetch(pic);
                if (imgRes.ok) {
                    const arrayBuf = await imgRes.arrayBuffer();
                    imageBuffer = Buffer.from(arrayBuf);
                }
            } catch (err) {
                console.error("Failed to fetch profile picture for PDF:", err);
            }
        } else {
            // Local path - check if file exists
            const localPath = "uploads/" + pic;
            if (fs.existsSync(localPath)) {
                try {
                    imageBuffer = fs.readFileSync(localPath);
                } catch (err) {
                    console.error("Failed to read local profile picture:", err);
                }
            }
        }
    }

    // --- Premium CV Colors ---
    const primaryColor = '#4F46E5';    // Indigo 600 (Accent)
    const textColor = '#1F2937';       // Gray 800 (Primary text)
    const secondaryTextColor = '#4B5563'; // Gray 600 (Subtext)
    const mutedTextColor = '#9CA3AF';   // Gray 400 (Muted / borders)
    const accentLine = '#E5E7EB';       // Gray 200 (Dividers)

    let currentY = 50;

    // Header layout
    if (imageBuffer) {
        try {
            // Draw profile image cropped in a perfect circle
            doc.save();
            doc.circle(90, 90, 40).clip();
            doc.image(imageBuffer, 50, 50, { width: 80, height: 80 });
            doc.restore();
            
            // Draw a subtle border circle around the cropped image
            doc.circle(90, 90, 40).lineWidth(1.5).stroke(primaryColor);
        } catch (e) {
            console.error("PDFKit error drawing profile image:", e);
        }
    }

    // Name & Title Header
    const textStartX = imageBuffer ? 150 : 50;
    
    doc.fillColor(primaryColor)
       .font('Helvetica-Bold')
       .fontSize(24)
       .text(userData.userId?.name || 'Professional Candidate', textStartX, 55);

    doc.fillColor(secondaryTextColor)
       .font('Helvetica-Oblique')
       .fontSize(12)
       .text(userData.currentPost || 'Professional Profile', textStartX, 82);

    // Contact info (Email, username)
    const email = userData.userId?.email || '';
    const username = userData.userId?.username ? `careerhub.com/in/${userData.userId.username}` : '';
    const contactInfo = [username, email].filter(Boolean).join('   |   ');

    doc.fillColor(mutedTextColor)
       .font('Helvetica')
       .fontSize(9)
       .text(contactInfo, textStartX, 105);

    currentY = 150;

    // Helper function to draw a section header
    const drawSectionHeader = (title, y) => {
        // Draw Accent block
        doc.rect(50, y, 4, 16).fill(primaryColor);
        
        doc.fillColor(primaryColor)
           .font('Helvetica-Bold')
           .fontSize(12)
           .text(title, 62, y + 2);

        // Draw horizontal divider line
        doc.moveTo(50, y + 22).lineTo(545, y + 22).stroke(accentLine);
        return y + 32;
    };

    // --- BIO SUMMARY SECTION ---
    if (userData.bio) {
        currentY = drawSectionHeader('PROFESSIONAL SUMMARY', currentY);
        
        doc.fillColor(textColor)
           .font('Helvetica')
           .fontSize(10)
           .text(userData.bio, 50, currentY, { width: 495, align: 'justify', lineGap: 3 });
        
        currentY += doc.heightOfString(userData.bio, { width: 495, lineGap: 3 }) + 25;
    }

    // --- WORK EXPERIENCE SECTION ---
    currentY = drawSectionHeader('WORK EXPERIENCE', currentY);

    if (userData.pastWork && userData.pastWork.length > 0) {
        const timelineX = 58;
        const timelineStartY = currentY + 5;
        let timelineEndY = currentY;

        userData.pastWork.forEach((work, index) => {
            if (currentY > 730) {
                doc.addPage();
                currentY = 50;
            }

            doc.circle(timelineX, currentY + 5, 3.5).fill(primaryColor);
            timelineEndY = currentY + 5;

            // Role / Position
            doc.fillColor(textColor)
               .font('Helvetica-Bold')
               .fontSize(11)
               .text(work.position || 'Position', 72, currentY);

            // Company Name
            doc.fillColor(secondaryTextColor)
               .font('Helvetica-Bold')
               .fontSize(10)
               .text(work.company || 'Company', 72, currentY + 14);

            // Duration (Years) aligned to the right
            doc.fillColor(secondaryTextColor)
               .font('Helvetica')
               .fontSize(9)
               .text(work.years || '', 350, currentY + 2, { width: 195, align: 'right' });

            currentY += 45;
        });

        // Draw the vertical timeline line behind the nodes
        doc.save();
        doc.moveTo(timelineX, timelineStartY)
           .lineTo(timelineX, timelineEndY)
           .lineWidth(1)
           .stroke(accentLine);
        doc.restore();
    } else {
        doc.fillColor(secondaryTextColor)
           .font('Helvetica-Oblique')
           .fontSize(10)
           .text('No work experience listed.', 50, currentY);
        currentY += 25;
    }

    currentY += 15;

    // --- EDUCATION SECTION ---
    if (currentY > 730) {
        doc.addPage();
        currentY = 50;
    }
    
    currentY = drawSectionHeader('EDUCATION', currentY);

    if (userData.education && userData.education.length > 0) {
        const timelineX = 58;
        const timelineStartY = currentY + 5;
        let timelineEndY = currentY;

        userData.education.forEach((edu, index) => {
            if (currentY > 730) {
                doc.addPage();
                currentY = 50;
            }

            doc.circle(timelineX, currentY + 5, 3.5).fill(primaryColor);
            timelineEndY = currentY + 5;

            // School / University
            doc.fillColor(textColor)
               .font('Helvetica-Bold')
               .fontSize(11)
               .text(edu.school || 'School/University', 72, currentY);

            // Degree & Field
            const degreeText = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ');
            doc.fillColor(secondaryTextColor)
               .font('Helvetica')
               .fontSize(10)
               .text(degreeText || 'Degree Details', 72, currentY + 14);

            currentY += 45;
        });

        // Draw vertical education timeline line
        doc.save();
        doc.moveTo(timelineX, timelineStartY)
           .lineTo(timelineX, timelineEndY)
           .lineWidth(1)
           .stroke(accentLine);
        doc.restore();
    } else {
        doc.fillColor(secondaryTextColor)
           .font('Helvetica-Oblique')
           .fontSize(10)
           .text('No education details listed.', 50, currentY);
        currentY += 25;
    }

    // Add footer page numbers
    let pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fillColor(mutedTextColor)
           .font('Helvetica')
           .fontSize(8)
           .text(
               `Page ${i + 1} of ${pages.count}`,
               50,
               800,
               { align: 'center', width: 512 }
           );
    }

    doc.end();
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
        const userIdQuery = req.query.userId || req.body?.userId;

        let user;
        if (userIdQuery) {
            user = await User.findOne({ _id: userIdQuery });
        } else {
            user = await User.findOne({ token: token });
        }

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
        const userProfile = await Profile.findOne({ userId: user_id }).populate('userId', 'name username email profilePicture');
        
        if (!userProfile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // Set response headers for direct attachment download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${userProfile.userId?.name || 'resume'}_resume.pdf"`);

        await convertUserDataToPDF(userProfile, res);
    } catch (error) {
        if (res.headersSent) {
            return;
        }
        return res.status(500).json({ message: error.message });
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

        // Notify recipient
        await createNotification(
            connectionUser._id,
            user._id,
            'connection_request',
            'Connection Request',
            `${user.name} sent you a connection request.`,
            '/directory'
        );

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
            await connection.save();

            // Notify original sender
            await createNotification(
                connection.userId,
                user._id,
                'connection_accept',
                'Connection Accepted',
                `${user.name} accepted your connection request.`,
                '/directory'
            );
        } else {
            connection.status_accepted = false;
            await connection.save();
        }
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

export const atsAnalyze = async (req, res) => {
    try {
        const { token, jobDescription } = req.body;
        if (!jobDescription) {
            return res.status(400).json({ message: "Job description is required" });
        }

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const profile = await Profile.findOne({ userId: user._id });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        const apiKey = process.env.GROQ_API_KEY;

        // If API key is missing, return error with a clean message (do not return fake simulated data)
        if (!apiKey) {
            console.log("GROQ_API_KEY is not configured. Refusing to analyze.");
            return res.status(400).json({
                error: "GROQ_KEY_MISSING",
                message: "Groq API Key is not configured in the backend environment. Please configure it to enable the ATS analysis feature."
            });
        }

        // Prepare prompt for Groq API
        const profileDetails = {
            name: user.name,
            bio: profile.bio || "No biography provided",
            headline: profile.currentPost || "No professional headline",
            pastWork: profile.pastWork || [],
            education: profile.education || [],
            resumeName: profile.resumeName || "No resume uploaded"
        };

        const promptText = `
You are an advanced ATS (Applicant Tracking System) resume analyzer. Analyze the following candidate profile details against the provided job description.
Identify the matching skills, missing skills, and give concrete suggestions on how the candidate can optimize their profile to rank higher for this specific role.

Candidate Profile Details:
${JSON.stringify(profileDetails, null, 2)}

Target Job Description:
${jobDescription}

Please respond strictly with a valid JSON object matching this schema (do not include markdown wrapping or backticks in the response, just raw JSON):
{
  "score": 75, // A number between 0 and 100 representing how well the profile matches the job description
  "matchedSkills": ["SkillA", "SkillB"], // Key skills found in the profile that match the job description
  "missingSkills": ["SkillC", "SkillD"], // Key skills/requirements from the job description missing or weak in the profile
  "suggestions": ["Suggestion 1", "Suggestion 2"], // Specific, actionable tips to improve the profile for this role
  "summary": "Short ATS summary explaining the score in one or two sentences"
}
`;

        const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
        
        const response = await fetch(groqUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [
                    { role: "system", content: "You are a precise ATS resume analyzer. Return only valid JSON." },
                    { role: "user", content: promptText }
                ],
                temperature: 0.2,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Groq API Error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        const responseText = data.choices?.[0]?.message?.content;
        
        if (!responseText) {
            throw new Error("Empty response from Groq API");
        }

        // Parse the JSON response
        const analysisResult = JSON.parse(responseText.trim());
        return res.json({
            isMock: false,
            ...analysisResult
        });

    } catch (error) {
        console.error("ATS analysis error:", error);
        return res.status(500).json({ message: "ATS analysis failed: " + error.message });
    }
};

export const uploadResumeFile = async (req, res) => {
    try {
        const { token, name } = req.body;
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        let profile = await Profile.findOne({ userId: user._id });
        if (!profile) {
            profile = new Profile({ userId: user._id });
        }

        profile.resumeUrl = req.file.path; // Cloudinary secure raw URL
        profile.resumeName = name || req.file.originalname || "Uploaded Resume";

        await profile.save();

        return res.json({ 
            message: "Resume uploaded successfully", 
            resumeUrl: profile.resumeUrl,
            resumeName: profile.resumeName
        });
    } catch (error) {
        console.error("Upload resume error:", error);
        return res.status(500).json({ message: "Upload failed: " + error.message });
    }
};

export const deleteResumeFile = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        const profile = await Profile.findOne({ userId: user._id });
        if (!profile) return res.status(404).json({ message: "Profile not found" });

        profile.resumeUrl = "";
        profile.resumeName = "";
        await profile.save();

        return res.json({ message: "Resume deleted successfully" });
    } catch (error) {
        console.error("Delete resume error:", error);
        return res.status(500).json({ message: "Delete failed: " + error.message });
    }
};

export const resumeAtsAnalyze = async (req, res) => {
    try {
        const { token } = req.body;
        if (!req.file && !req.body.resumeUrl) {
            return res.status(400).json({ message: "Resume file is required" });
        }

        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        const profile = await Profile.findOne({ userId: user._id });
        if (!profile) return res.status(404).json({ message: "Profile not found" });

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(400).json({
                error: "GROQ_KEY_MISSING",
                message: "Groq API Key is not configured in the backend environment. Please configure it to enable the ATS analysis feature."
            });
        }

        const resumeName = req.body.resumeName || req.file?.originalname || profile.resumeName || "Uploaded Resume";
        const resumeUrl = req.body.resumeUrl || req.file?.path || profile.resumeUrl || "";
        let resumeText = req.body.resumeText || "";

        if (!resumeText && resumeUrl) {
            try {
                const resumeResponse = await fetch(resumeUrl);
                if (resumeResponse.ok) {
                    const resumeBuffer = Buffer.from(await resumeResponse.arrayBuffer());
                    const parsedResume = await pdfParse(resumeBuffer);
                    resumeText = parsedResume.text || "";
                }
            } catch (parseError) {
                console.error("Resume fetch/parse error:", parseError);
            }
        }

        const promptText = `
You are an ATS resume reviewer.
First, infer the most likely job profile or target role for this resume.
Then infer whether the resume is for a fresher/entry-level candidate or an experienced candidate.
Use only role-relevant requirements for that level.
If the resume is clearly fresher-level, do not invent senior requirements like technical architecture ownership, metrics-driven decision making, or user research unless the resume text actually supports them.
Score this resume from 0 to 100 based on ATS friendliness, clarity, formatting, keyword usage, role fit, and level fit.
Return only valid JSON.

Resume details:
${JSON.stringify({
    candidateName: user.name,
    headline: profile.currentPost || "",
    bio: profile.bio || "",
    resumeName,
    resumeUrl,
    resumeText
}, null, 2)}

Return this JSON schema:
{
  "score": 78,
  "jobProfile": "Frontend Developer",
  "candidateLevel": "fresher",
  "levelReasoning": "The resume shows only academic projects and internships, so it is fresher-level.",
  "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
  "coveredRequirements": ["Requirement 1"],
  "matchedSkills": ["..."],
  "missingSkills": ["..."],
  "suggestions": ["..."],
  "summary": "..."
}
`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [
                    { role: "system", content: "You are a precise ATS resume analyzer. Only use skills and requirements that match the inferred job role and candidate level. Return only valid JSON." },
                    { role: "user", content: promptText }
                ],
                temperature: 0.05,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Groq API Error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        const responseText = data.choices?.[0]?.message?.content;
        if (!responseText) {
            throw new Error("Empty response from Groq API");
        }

        const analysisResult = JSON.parse(responseText.trim());
        return res.json({ isMock: false, resumeName, resumeUrl, ...analysisResult });
    } catch (error) {
        console.error("Resume ATS analysis error:", error);
        return res.status(500).json({ message: "ATS analysis failed: " + error.message });
    }
};
