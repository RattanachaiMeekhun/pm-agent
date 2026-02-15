import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/Axios";

export const fetchProjectList = createAsyncThunk(
    "dashboard/fetchProjectList",
    async (_,thunkAPI) => {
        const response = await api.get("/api/v1/project/list");
        return response.data;
    }
)