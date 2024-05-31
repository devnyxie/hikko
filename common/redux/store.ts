import { configureStore } from "@reduxjs/toolkit";
import themeSlice from "./features/theme/themeSlice";
import { createWrapper, Context, HYDRATE } from "next-redux-wrapper";

export const makeStore = () => {
  return configureStore({
    reducer: {
      theme: themeSlice,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// TS-BS: Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// issue: redux reducer must be defined
