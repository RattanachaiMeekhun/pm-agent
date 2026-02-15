import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/Axios";
import { ProjectUpdatePayload } from "./project.types";

export const getProjectById = createAsyncThunk(
    "project/getProjectById",
    async (id: number) => {
        const response = await api.get(`/api/v1/project/${id}`);
        return response.data;
    }   
);

export const updateProjectSow = createAsyncThunk(
    "project/updateProjectSow",
    async (payload: ProjectUpdatePayload) => {
        const response = await api.patch(`/api/v1/project/${payload.id}`, {
            sow_structured: payload.sow_structured,
        });
        return response.data;
    }
);
