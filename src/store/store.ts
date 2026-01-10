import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./features/app.ts";
import authReducer from "./features/authSlice.ts";
import { apiSlice } from "./api/apiSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
