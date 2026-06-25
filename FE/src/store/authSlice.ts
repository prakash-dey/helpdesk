import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role: string;
  orgId?: string;
};

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  isSessionRestoring: boolean;
};

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isSessionRestoring: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload;
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
    setSessionRestoring(state, action: PayloadAction<boolean>) {
      state.isSessionRestoring = action.payload;
    },
    logout(state) {
      state.accessToken = null;
      state.user = null;
      state.isSessionRestoring = false;
    },
  },
});

export const {
  setAccessToken,
  setUser,
  setSessionRestoring,
  logout,
} = authSlice.actions;

export const authReducer = authSlice.reducer;