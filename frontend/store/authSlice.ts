import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../utils/api';

interface AuthState {
  token: string | null;
  user: any | null;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: any;
}

const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    return {
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')!)
        : null,
      loading: false,
      error: null,
    };
  }
  return { token: null, user: null, loading: false, error: null };
};

export const loginUser = createAsyncThunk<AuthResponse, LoginCredentials, { rejectValue: string }>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const data = await api.login(credentials);
    if (data.token) {
      return data as AuthResponse;
    }
    return rejectWithValue(data.message || data.error || 'Invalid credentials. Please try again.');
  } catch {
    return rejectWithValue('Network error. Please check your connection.');
  }
});

export const registerUser = createAsyncThunk<AuthResponse,RegisterData,{ rejectValue: string }>('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    const data = await api.register(userData);
    if (data.token) {
      return data as AuthResponse;
    }
    return rejectWithValue(data.message || data.error || 'Registration failed. Please try again.');
  } catch {
    return rejectWithValue('Network error. Please check your connection.');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
          localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Login failed.';
      });
      
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
          localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Registration failed.';
      });
  },
});

export const { logout, clearAuthError, updateUser } = authSlice.actions;
export default authSlice.reducer;
