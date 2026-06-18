import User from "../models/userModel.js";
import Post from '../models/postModel.js';
import Comment from '../models/commentModel.js';
import cloudinary from '../config/cloudinary.js';


export const createPost = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      if (req.file) {
        const publicId = req.file.filename || req.file.public_id;
        if (publicId) {
          const isVideo = req.file.mimetype.startsWith('video/');
          await cloudinary.uploader.destroy(publicId, { resource_type: isVideo ? 'video' : 'image' });
        }
      }
      return res.status(404).json({ message: "User not found" });
    }

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');
      if (isVideo && req.file.size > 5 * 1024 * 1024) {
        const publicId = req.file.filename || req.file.public_id;
        if (publicId) {
          await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        }
        return res.status(400).json({ message: "Video must be under 5MB" });
      }
    }

    const post = new Post({
        userId: user._id,
        body: req.body.body,
        media: req.file ? req.file.path : "",
        fileType: req.file ? req.file.mimetype.split("/")[1] : ""
    })

    await post.save();

    return res.status(200).json({message: " post created"});
  } catch (error) {
    if (req.file) {
      const publicId = req.file.filename || req.file.public_id;
      if (publicId) {
        const isVideo = req.file.mimetype.startsWith('video/');
        await cloudinary.uploader.destroy(publicId, { resource_type: isVideo ? 'video' : 'image' });
      }
    }
    return res.status(500).json({message:error.message});
  }
};

export const getAllPosts = async (req,res) =>{
    try {
        const posts = await Post.find().populate('userId', ' name username email profilePicture').lean();
        
        const postsWithComments = await Promise.all(
            posts.map(async (post) => {
                const commentCount = await Comment.countDocuments({ postId: post._id });
                return {
                    ...post,
                    commentCount
                };
            })
        );

        return res.json({posts: postsWithComments});
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const deletePost = async (req, res) =>{
    const {token, post_id} = req.body;

    try {
        const user = await User.findOne({token}).select("_id")
        if(!user){
            return res.status(404).json({message: "user not found"})
        }

        const post = await Post.findOne({_id: post_id});
        if(!post){
            return res.status(404).json({message: "post not found"})
        }
        if(post.userId.toString() !== user._id.toString()){
            return res.status(401).json({message:"unauthorized"})
        }

        await Post.deleteOne({_id: post_id})
        return res.json({message:"post Deleted"});
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const commentPost = async(req,res) =>{
    const {token, post_id, commentBody} = req.body;

    try {
        const user = await User.findOne({ token }).select("_id")
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }

        const post = await Post.findOne({ _id: post_id });
        if (!post) {
            return res.status(404).json({ message: "post not found" })
        }

        const comment = new Comment({
            userId: user._id,
            postId: post_id,
            body: commentBody
        })

        await comment.save();
        return res.json({message:" comment Added"})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}

export const get_comments_by_post = async (req,res) =>{
    const {post_id} = req.body;

    try {
        const comments = await Comment.find({ postId: post_id }).populate('userId', 'name username profilePicture');

        return res.json({comments})
    } catch (error) {
        return res.status(500).json({message:error.message});
    }
}

export const deleteComemntOfUser = async (req,res) =>{
    const token = req.body?.token || req.query.token || req.headers['x-auth-token'];
    const comment_id = req.body?.comment_id || req.query.comment_id;

    try {
        const user = await User.findOne({token}).select("_id")
        if(!user){
            return res.status(404).json({message:"user not found"})
        }

        const comment = await Comment.findOne({"_id": comment_id})
        if(!comment){
            return res.status(401).json({message: "comment not found"})
        }

        if(comment.userId.toString() !== user._id.toString()){
            return res.status(401).json({message: "unauthorized"})
        }

        await Comment.deleteOne({"_id": comment_id});

        return res.json({message: "Comment deleted"})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}

export const increment_likes = async(req, res) =>{
    const {post_id} = req.body;

    try {
        const post = await Post.findOne({_id: post_id});
        if (!post) {
            return res.status(404).json({ message: "post not found" })
        }

        post.likes = post.likes +1;
        
        await post.save();
        return res.json({message: "Likes incremented"})
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}