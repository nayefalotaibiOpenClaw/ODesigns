"use client";

import { createContext, useContext } from "react";

export const EditContext = createContext(false);
export const useEditMode = () => useContext(EditContext);
