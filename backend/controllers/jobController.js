import Job from "../models/jobModel.js";
import User from "../models/userModel.js";

export const createJob = async (req, res) => {
    const { token, title, company, location, salary, description, requirements } = req.body;
    try {
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!title || !company || !location || !description) {
            return res.status(400).json({ message: "Please fill all required fields: title, company, location, description" });
        }

        const reqs = Array.isArray(requirements) 
            ? requirements 
            : typeof requirements === 'string' 
                ? requirements.split(',').map(r => r.trim()).filter(Boolean) 
                : [];

        const job = new Job({
            title,
            company,
            location,
            salary: salary || "",
            description,
            requirements: reqs,
            postedBy: user._id
        });

        await job.save();
        return res.status(201).json({ message: "Job created successfully", job });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate('postedBy', 'name username profilePicture')
            .populate('applicants', 'name username profilePicture')
            .sort({ createdAt: -1 });
        return res.json({ jobs });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const applyToJob = async (req, res) => {
    const { token, jobId } = req.body;
    try {
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });

        if (job.applicants.includes(user._id)) {
            return res.status(400).json({ message: "You have already applied to this job" });
        }

        job.applicants.push(user._id);
        await job.save();

        return res.json({ message: "Applied successfully", job });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
