import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  user: any | null;
}

const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    return {
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
    };
  }
  return { token: null, user: null };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ token: string; user: any }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
