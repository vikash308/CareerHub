import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PostState {
  posts: any[];
}

const initialState: PostState = {
  posts: [],
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<any[]>) => {
      state.posts = action.payload;
    },
    addPost: (state, action: PayloadAction<any>) => {
      state.posts.unshift(action.payload);
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((post) => post._id !== action.payload);
    },
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
