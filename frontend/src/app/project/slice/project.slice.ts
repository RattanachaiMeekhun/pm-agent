import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProjectItem, SowData } from "./project.types";
import { getProjectById, updateProjectSow } from "./project.thunks";

interface ProjectState {
    projectItem: ProjectItem | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: ProjectState = {
    projectItem: null,
    loading: false,
    saving: false,
    error: null,
};

export const projectSlice = createSlice({
    name: "project",
    initialState,
    reducers: {
        /** Optimistic local update for SOW data (before API call) */
        setSowLocal: (state, action: PayloadAction<SowData>) => {
            if (state.projectItem) {
                state.projectItem.sow_structured = action.payload;
            }
        },
        clearProject: (state) => {
            state.projectItem = null;
            state.loading = false;
            state.saving = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // --- getProjectById ---
        builder.addCase(getProjectById.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getProjectById.fulfilled, (state, action) => {
            state.projectItem = action.payload;
            state.loading = false;
        });
        builder.addCase(getProjectById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "Failed to load project";
        });

        // --- updateProjectSow ---
        builder.addCase(updateProjectSow.pending, (state) => {
            state.saving = true;
            state.error = null;
        });
        builder.addCase(updateProjectSow.fulfilled, (state, action) => {
            state.projectItem = action.payload;
            state.saving = false;
        });
        builder.addCase(updateProjectSow.rejected, (state, action) => {
            state.saving = false;
            state.error = action.error.message || "Failed to save project";
        });
    },
});

export const { setSowLocal, clearProject } = projectSlice.actions;
export default projectSlice.reducer;