import Job from "../models/jobModel.js";
import User from "../models/userModel.js";
import JobApplication from "../models/jobApplicationModel.js";
import { createNotification, notifyAllUsers } from "./notificationController.js";

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

        await notifyAllUsers(
            user._id,
            'job_posted',
            'New Job Listing',
            `${company} is hiring for ${title}!`,
            '/jobs'
        );

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

        if (job.postedBy && job.postedBy.toString() === user._id.toString()) {
            return res.status(400).json({ message: "You cannot apply to your own job listing" });
        }

        if (job.applicants.includes(user._id)) {
            return res.status(400).json({ message: "You have already applied to this job" });
        }

        job.applicants.push(user._id);
        await job.save();

        // Create a corresponding JobApplication record
        let application = await JobApplication.findOne({ jobId, userId: user._id });
        if (!application) {
            application = new JobApplication({
                jobId,
                userId: user._id,
                status: "Applied",
                appliedWithResume: req.body.appliedWithResume || "profile",
                resumeName: req.body.resumeName || "Generated CV"
            });
            await application.save();

            // Notify job poster
            if (job.postedBy && job.postedBy.toString() !== user._id.toString()) {
                await createNotification(
                    job.postedBy,
                    user._id,
                    'job_applied',
                    'Job Application',
                    `${user.name} applied for your job listing: ${job.title}.`,
                    '/jobs'
                );
            }
        }

        return res.json({ message: "Applied successfully", job, application });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getUserApplications = async (req, res) => {
    const token = req.query.token || req.body.token || req.headers.authorization?.split(' ')[1];
    try {
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Retrieve existing applications
        const applications = await JobApplication.find({ userId: user._id })
            .populate('jobId')
            .sort({ createdAt: -1 });

        // Auto-sync fallback for backward compatibility:
        const appliedJobs = await Job.find({ applicants: user._id });
        const existingJobIds = new Set(applications.map(app => app.jobId?._id?.toString()).filter(Boolean));

        const newAppsToInsert = [];
        for (const job of appliedJobs) {
            if (!existingJobIds.has(job._id.toString())) {
                const newApp = new JobApplication({
                    jobId: job._id,
                    userId: user._id,
                    status: "Applied"
                });
                newAppsToInsert.push(newApp);
            }
        }

        if (newAppsToInsert.length > 0) {
            await JobApplication.insertMany(newAppsToInsert);
            const updatedApplications = await JobApplication.find({ userId: user._id })
                .populate('jobId')
                .sort({ createdAt: -1 });
            return res.json({ applications: updatedApplications });
        }

        return res.json({ applications });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const updateApplicationStatus = async (req, res) => {
    const { token, applicationId, status } = req.body;
    try {
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        const application = await JobApplication.findById(applicationId).populate('jobId');
        if (!application) return res.status(404).json({ message: "Application not found" });

        const isApplicant = application.userId.toString() === user._id.toString();
        const isJobPoster = application.jobId && application.jobId.postedBy.toString() === user._id.toString();

        if (!isApplicant && !isJobPoster) {
            return res.status(403).json({ message: "Unauthorized to update this application" });
        }

        if (status) {
            application.status = status;
        }

        await application.save();
        return res.json({ message: "Application status updated successfully", application });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getPostedJobs = async (req, res) => {
    const token = req.query.token || req.body.token || req.headers.authorization?.split(' ')[1];
    try {
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        const myPostedJobs = await Job.find({ postedBy: user._id }).sort({ createdAt: -1 });
        const postedJobIds = myPostedJobs.map(job => job._id);

        const applications = await JobApplication.find({ jobId: { $in: postedJobIds } })
            .populate('userId', 'name username profilePicture email')
            .sort({ createdAt: -1 });

        // Auto-sync backward compatibility check:
        const appsToInsert = [];
        const existingAppMap = new Set(
            applications.map(app => `${app.jobId.toString()}_${app.userId?._id?.toString()}`)
        );

        for (const job of myPostedJobs) {
            for (const applicantId of job.applicants) {
                const key = `${job._id.toString()}_${applicantId.toString()}`;
                if (!existingAppMap.has(key)) {
                    const newApp = new JobApplication({
                        jobId: job._id,
                        userId: applicantId,
                        status: "Applied"
                    });
                    appsToInsert.push(newApp);
                }
            }
        }

        if (appsToInsert.length > 0) {
            await JobApplication.insertMany(appsToInsert);
            const updatedApplications = await JobApplication.find({ jobId: { $in: postedJobIds } })
                .populate('userId', 'name username profilePicture email')
                .sort({ createdAt: -1 });
            return res.json({ jobs: myPostedJobs, applications: updatedApplications });
        }

        return res.json({ jobs: myPostedJobs, applications });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
