import { createAsyncThunk } from "@reduxjs/toolkit";
import { LoginRequest, LoginResponse } from "./auth.types";
import api from "@/lib/Axios";

const loginThunk = createAsyncThunk<LoginResponse, LoginRequest>(
  "auth/login",
  async (credentials: LoginRequest) => {
    const response = await api.post("/api/v1/auth/login", credentials);
    return response.data;
  },
);

export default loginThunk;
