import { createSlice } from "@reduxjs/toolkit";
import loginThunk from "./auth.thunks";
import { User } from "./auth.types";

interface AuthState {
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
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
  },
  extraReducers: (builder) => {
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
    });
  },
});

export const { setUser, setToken } = authSlice.actions;
export default authSlice.reducer;
