import { createSlice } from "@reduxjs/toolkit";
import { loginThunk, registerThunk, tokenValidationThunk } from "./auth.thunks";
import { User } from "./auth.types";

interface AuthState {
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      localStorage.setItem("token", token);
    });
    builder.addCase(registerThunk.fulfilled, (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      localStorage.setItem("token", token);
    });
    builder.addCase(tokenValidationThunk.fulfilled, (state, action) => {
      const { user } = action.payload;
      state.user = user;
    });
    builder.addCase(tokenValidationThunk.rejected, (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    });
  },
});

export const { setUser, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
