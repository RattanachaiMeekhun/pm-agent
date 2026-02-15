import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store";

export const selectProjectList = createSelector(
    (state: RootState) => state.dashboard.projectList,
    (projectList) => projectList
)