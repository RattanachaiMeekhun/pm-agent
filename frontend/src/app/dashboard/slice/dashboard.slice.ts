import { createSlice } from "@reduxjs/toolkit";
import { fetchProjectList } from "./dashboard.thunks";

export const dashboardSlice = createSlice({
    name: "dashboard",
    initialState: {
        projectList: [],
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchProjectList.fulfilled, (state, action) => {
            state.projectList = action.payload
        })
    }
})

export const {  } = dashboardSlice.actions
export default dashboardSlice.reducer