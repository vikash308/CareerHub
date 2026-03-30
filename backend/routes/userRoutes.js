import { Router } from "express";   
import { acceptConnectionRequest, downloadProfile, getAllUserProfile, getMyConnectionRequests, getUserAndProfile, login, register, sendConnectionRequest, updateProfileData, updateUserProfile, uploadProfilePicture, whatAreMyConnection } from "../controllers/userController.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'uploads/')
    },
    filename:(req, file , cb) =>{
        cb(null, file.originalname)
    }
})

const upload = multer({storage:storage})

router.route("/update_profile_picture").post(upload.single('profile_picture'),uploadProfilePicture)

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

export default router;