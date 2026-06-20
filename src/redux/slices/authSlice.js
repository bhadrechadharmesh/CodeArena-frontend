import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Set up base URL for Axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const initialState = {
  token: token || null,
  isAuthenticated: !!token,
  user: JSON.parse(localStorage.getItem('user')) || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    },
  },
});

export const { authStart, authSuccess, authFailure, logout } = authSlice.actions;

// Async Thunks
export const registerUserThunk = (userData) => async (dispatch) => {
  dispatch(authStart());
  try {
    const res = await axios.post('/api/auth/register', userData);
    dispatch(authSuccess(res.data));
    return { success: true };
  } catch (err) {
    const errMsg = err.response?.data?.message || 'Registration failed';
    dispatch(authFailure(errMsg));
    return { success: false, error: errMsg };
  }
};

export const loginUserThunk = (credentials) => async (dispatch) => {
  dispatch(authStart());
  try {
    const res = await axios.post('/api/auth/login', credentials);
    dispatch(authSuccess(res.data));
    return { success: true };
  } catch (err) {
    const errMsg = err.response?.data?.message || 'Login failed';
    dispatch(authFailure(errMsg));
    return { success: false, error: errMsg };
  }
};

export const getMeThunk = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/auth/me');
    const tokenVal = localStorage.getItem('token');
    dispatch(authSuccess({ token: tokenVal, user: res.data.user }));
  } catch (err) {
    dispatch(logout());
  }
};

export default authSlice.reducer;
