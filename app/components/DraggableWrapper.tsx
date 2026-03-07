"use client";

import React, { useContext, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useDragControls } from 'framer-motion';
import { EditContext } from './EditContext';
import { Move } from 'lucide-react';

const STORAGE_KEY = "sylo-drag-positions";

function loadPosition(id: string): { x: number; y: number } {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return data[id] || { x: 0, y: 0 };
  } catch { return { x: 0, y: 0 }; }
}

function savePosition(id: string, xVal: number, yVal: number) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    data[id] = { x: xVal, y: yVal };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

interface DraggableWrapperProps {
  children: React.ReactNode;
  className?: string;
  id: string;
  dir?: string;
  style?: React.CSSProperties;
}

export default function DraggableWrapper({ children, className = "", id, dir, style }: DraggableWrapperProps) {
  const isEditMode = useContext(EditContext);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dragControls = useDragControls();

  useEffect(() => {
    const saved = loadPosition(id);
    if (saved.x !== 0 || saved.y !== 0) {
      x.set(saved.x);
      y.set(saved.y);
    }
  }, [id, x, y]);

  const handleDragEnd = useCallback(() => {
    savePosition(id, x.get(), y.get());
  }, [id, x, y]);

  return (
    <motion.div
      drag={isEditMode}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragTransition={{ power: 0 }}
      style={{ x, y, touchAction: isEditMode ? 'none' : 'auto', ...style }}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
      onDragEnd={handleDragEnd}
      dir={dir}
      className={`${className}`}
    >
      {isEditMode && (
        <div className="absolute -inset-2 border-2 border-dashed border-[#B7FF5B]/40 rounded-xl pointer-events-none z-50">
          <div
            className="absolute -top-3 -left-3 bg-[#B7FF5B] text-[#1B4332] p-1 rounded-md shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto z-50"
            onPointerDown={(e) => dragControls.start(e)}
          >
             <Move size={14} />
          </div>
        </div>
      )}

      {children}
    </motion.div>
  );
}
