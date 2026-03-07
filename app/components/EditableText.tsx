"use client";

import React from "react";
import { useEditMode } from "./EditContext";

interface EditableTextProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export default function EditableText({ children, className = "", as: Tag = "span" }: EditableTextProps) {
  const editMode = useEditMode();

  if (!editMode) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      className={`${className} outline-none ring-1 ring-dashed ring-yellow-400/60 rounded px-0.5 cursor-text hover:ring-yellow-400 focus:ring-yellow-400 focus:ring-2`}
    >
      {children}
    </Tag>
  );
}
