import { Router } from "express";
import { createJob, getAllJobs, applyToJob } from "../controllers/jobController.js";

const router = Router();

router.route("/jobs").get(getAllJobs).post(createJob);
router.route("/jobs/apply").post(applyToJob);

export default router;
