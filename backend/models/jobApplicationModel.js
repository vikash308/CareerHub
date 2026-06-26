import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Screening', 'Interviewing', 'Offered', 'Rejected'],
        default: 'Applied'
    },
    appliedWithResume: {
        type: String,
        default: 'profile'
    },
    resumeName: {
        type: String,
        default: 'Generated CV'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplication;
