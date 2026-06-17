/**
 * postSlice.ts – Updated Day 4
 * Uses the proper Post type from types.ts.
 * PostCard manages its own local like count optimistically;
 * likePost here just syncs the Redux store's likes field.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Post } from './types';

interface PostState {
  posts: Post[];
}

const initialState: PostState = {
  posts: [],
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    /** Replace the entire posts array (called after API fetch). */
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },

    /** Prepend a new post (optimistic create). */
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },

    /** Remove a post by _id (after delete confirmation). */
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((p) => p._id !== action.payload);
    },

    /** Increment likes on a specific post in the Redux store. */
    likePost: (state, action: PayloadAction<{ postId: string }>) => {
      const post = state.posts.find((p) => p._id === action.payload.postId);
      if (post) {
        post.likes += 1;
      }
    },
  },
});

export const { setPosts, addPost, deletePost, likePost } = postSlice.actions;
export default postSlice.reducer;
