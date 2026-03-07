"use client";

import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { EditContext } from './EditContext';
import { Move } from 'lucide-react';

interface DraggableWrapperProps {
  children: React.ReactNode;
  className?: string;
  id: string;
}

// Global registry to store positions for exporting
const positionRegistry: Record<string, { x: number; y: number }> = {};

export const getLayoutConfig = () => {
  const textElements = document.querySelectorAll('[contenteditable="true"]');
  const texts: Record<string, string> = {};
  textElements.forEach((el, i) => {
    const id = el.getAttribute('data-id') || `text-${i}`;
    texts[id] = el.textContent || "";
  });

  return {
    positions: positionRegistry,
    texts
  };
};

export default function DraggableWrapper({ children, className = "", id }: DraggableWrapperProps) {
  const isEditMode = useContext(EditContext);

  const handleDragEnd = (event: any, info: any) => {
    positionRegistry[id] = {
      x: Math.round(info.point.x - info.start.x),
      y: Math.round(info.point.y - info.start.y)
    };
  };

  if (!isEditMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02, zIndex: 50 }}
      className={`relative group ${className}`}
    >
      <div className="absolute -inset-2 border-2 border-dashed border-[#B7FF5B]/40 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute -top-3 -left-3 bg-[#B7FF5B] text-[#1B4332] p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-move shadow-lg z-50">
         <Move size={14} />
      </div>
      {children}
    </motion.div>
  );
}
