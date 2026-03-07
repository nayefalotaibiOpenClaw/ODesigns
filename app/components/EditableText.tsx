"use client";

import React, { useContext } from "react";
import { EditContext } from "./EditContext";

interface EditableTextProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  className?: string;
}

export default function EditableText({
  children,
  as: Component = "span",
  className = "",
}: EditableTextProps) {
  const isEditMode = useContext(EditContext);

  if (!isEditMode) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component
      contentEditable
      suppressContentEditableWarning
      className={`${className} outline-none border-b border-dashed border-[#B7FF5B]/50 hover:border-[#B7FF5B] transition-colors cursor-text select-text`}
      onClick={(e) => e.stopPropagation()} // Prevent drag start when clicking to edit
      onPointerDown={(e) => e.stopPropagation()} // Critical for framer-motion drag
    >
      {children}
    </Component>
  );
}
