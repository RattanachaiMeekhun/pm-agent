import { createAsyncThunk } from "@reduxjs/toolkit";
import { LoginRequest, LoginResponse } from "./auth.types";
import api from "@/lib/Axios";

export const loginThunk = createAsyncThunk<LoginResponse, LoginRequest>(
  "auth/login",
  async (credentials: LoginRequest) => {
    const response = await api.post("/api/v1/auth/login", credentials);
    return response.data;
  },
);

export const registerThunk = createAsyncThunk<LoginResponse, LoginRequest>(
  "auth/register",
  async (credentials: LoginRequest) => {
    const response = await api.post("/api/v1/auth/register", credentials);
    return response.data;
  },
);

export const tokenValidationThunk = createAsyncThunk<LoginResponse, void>(
  "auth/tokenValidation",
  async () => {
    const response = await api.get("/api/v1/auth/me");
    return response.data;
  },
);
 
