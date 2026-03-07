"use client";

import React, { useContext, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useDragControls } from 'framer-motion';
import { EditContext, useSelectedId, useSetSelectedId, ParentSelectedContext } from './EditContext';
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
  const selectedId = useSelectedId();
  const setSelectedId = useSetSelectedId();
  const isSelected = isEditMode && selectedId === id;
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

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setSelectedId(isSelected ? null : id);
  }, [isEditMode, isSelected, id, setSelectedId]);

  return (
    <motion.div
      drag={isSelected}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragTransition={{ power: 0 }}
      style={{ x, y, touchAction: isSelected ? 'none' : 'auto', ...style }}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      dir={dir}
      className={`${className}`}
    >
      {isSelected && (
        <div className="absolute -inset-2 border-2 border-dashed border-[#B7FF5B]/40 rounded-xl pointer-events-none z-50">
          <div
            className="absolute -top-3 -left-3 bg-[#B7FF5B] text-[#1B4332] p-1 rounded-md shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto z-50"
            onPointerDown={(e) => dragControls.start(e)}
          >
             <Move size={14} />
          </div>
        </div>
      )}

      <ParentSelectedContext.Provider value={isSelected}>
        {children}
      </ParentSelectedContext.Provider>
    </motion.div>
  );
}
