import { Router } from "express";
import { acceptConnectionRequest, atsAnalyze, changePassword, deleteUserAccount, downloadProfile, getAllUserProfile, getMyConnectionRequests, getUserAndProfile, login, register, sendConnectionRequest, updateProfileData, updateUserProfile, uploadProfilePicture, whatAreMyConnection, uploadResumeFile, deleteResumeFile } from "../controllers/userController.js";
import { uploadToCloudinary, uploadResume } from "../config/cloudinary.js";
import { getUserNotifications, markNotificationsAsRead } from "../controllers/notificationController.js";

const router = Router();

router.route("/update_profile_picture").post(uploadToCloudinary.single('profile_picture'), uploadProfilePicture)
router.route("/user/upload_resume").post(uploadResume.single('resume'), uploadResumeFile)
router.route("/user/delete_resume").post(deleteResumeFile)

router.route("/user/notifications").get(getUserNotifications);
router.route("/user/notifications/read").post(markNotificationsAsRead);

router.route('/register').post(register);
router.route('/login').post(login)
router.route('/user_update').post(updateUserProfile)
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route('/update_profile_data').post(updateProfileData);

router.route("/user/get_all_user_profile").get(getAllUserProfile);
router.route("/user/download_resume").get(downloadProfile)
router.route("/user/send_connection_request").post(sendConnectionRequest);
router.route("/user/getConnectionRequests").get(getMyConnectionRequests);
router.route("/user/user_connection_request").get(whatAreMyConnection)
router.route("/user/accept_connection_request").post(acceptConnectionRequest);
router.route("/user/change_password").post(changePassword);
router.route("/user/delete_account").post(deleteUserAccount);
router.route("/user/ats_analyze").post(atsAnalyze);

export default router;