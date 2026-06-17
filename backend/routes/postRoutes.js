import { Router } from "express";
import { commentPost, createPost, deleteComemntOfUser, deletePost, get_comments_by_post, getAllPosts, increment_likes } from "../controllers/postController.js";
import { uploadPostMedia } from "../config/cloudinary.js";

const router = Router();

router.route('/post').post(uploadPostMedia.single('media'), createPost);
router.route('/posts').get(getAllPosts);
router.route("/delete_post").post(deletePost);
router.route("/comment").post(commentPost);
router.route("/get_comments").get(get_comments_by_post);
router.route("/delete_comment").delete(deleteComemntOfUser)
router.route("/increment_post_like").post(increment_likes);

export default router;