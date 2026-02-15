import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "@/app/dashboard/slice/dashboard.slice";
import projectReducer from "@/app/project/slice/project.slice";

export const store = configureStore({
    reducer: {
        dashboard: dashboardReducer,
        project: projectReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store