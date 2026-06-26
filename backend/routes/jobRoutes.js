import { Router } from "express";
import { 
    createJob, 
    getAllJobs, 
    applyToJob, 
    getUserApplications, 
    updateApplicationStatus, 
    getPostedJobs 
} from "../controllers/jobController.js";

const router = Router();

router.route("/jobs").get(getAllJobs).post(createJob);
router.route("/jobs/apply").post(applyToJob);
router.route("/jobs/applications").get(getUserApplications);
router.route("/jobs/applications/status").post(updateApplicationStatus);
router.route("/jobs/posted").get(getPostedJobs);

export default router;
