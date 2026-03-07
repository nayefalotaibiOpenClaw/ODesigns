"use client";

import { createContext, useContext } from "react";

export const EditContext = createContext(false);
export const useEditMode = () => useContext(EditContext);

export type AspectRatioType = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export const AspectRatioContext = createContext<AspectRatioType>("1:1");
export const useAspectRatio = () => useContext(AspectRatioContext);
