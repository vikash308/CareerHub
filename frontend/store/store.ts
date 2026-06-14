import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import postReducer from './postSlice';
import profileReducer from './profileSlice';
import connectionReducer from './connectionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    profile: profileReducer,
    connections: connectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
