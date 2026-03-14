"use client";

import React, { useContext, useRef, useCallback, useId, useState } from "react";
import { EditContext, useSetSelectedId } from "./EditContext";
import { useElementOverride, useSetOverride } from "./OverrideContext";
import { useSelectedElement } from "./SelectedElementContext";
import { Paintbrush, Type, ChevronDown } from "lucide-react";

// Map Tailwind text size classes to CSS font-size values
const FONT_SIZE_MAP: Record<string, string> = {
  "text-xs": "0.75rem",
  "text-sm": "0.875rem",
  "text-base": "1rem",
  "text-lg": "1.125rem",
  "text-xl": "1.25rem",
  "text-2xl": "1.5rem",
  "text-3xl": "1.875rem",
  "text-4xl": "2.25rem",
  "text-5xl": "3rem",
  "text-6xl": "3.75rem",
  "text-7xl": "4.5rem",
};

const FONT_SIZES = [
  { label: "S", value: "text-2xl" },
  { label: "M", value: "text-3xl" },
  { label: "L", value: "text-4xl" },
  { label: "XL", value: "text-5xl" },
  { label: "2XL", value: "text-6xl" },
  { label: "3XL", value: "text-7xl" },
];

const PRESET_COLORS = [
  "#FFFFFF", "#000000", "#1B4332", "#B7FF5B",
  "#EF4444", "#3B82F6", "#F59E0B", "#8B5CF6",
  "#EC4899", "#10B981", "#6366F1", "#F97316",
];

interface EditableTextProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  className?: string;
  style?: React.CSSProperties;
  configKey?: string;
}

export default function EditableText({
  children,
  as: Component = "span",
  className = "",
  style,
  configKey,
}: EditableTextProps) {
  const autoId = useId();
  const resolvedKey = configKey ?? `auto-${autoId}`;
  const isEditMode = useContext(EditContext);
  const override = useElementOverride(resolvedKey);
  const setOverride = useSetOverride();
  const { setSelectedElement, selectedElementKey } = useSelectedElement();
  const setDraggableSelectedId = useSetSelectedId();
  const elRef = useRef<HTMLDivElement>(null);

  // Inline toolbar state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [customColor, setCustomColor] = useState("#000000");

  // Build override styles
  const overrideStyle: React.CSSProperties = { ...style };
  if (override?.color) {
    overrideStyle.color = override.color;
  }
  if (override?.fontSize && FONT_SIZE_MAP[override.fontSize]) {
    overrideStyle.fontSize = FONT_SIZE_MAP[override.fontSize];
  }

  const displayContent = override?.text ?? children;

  const handleBlur = useCallback(() => {
    if (!elRef.current) return;
    const newText = elRef.current.innerText;
    const currentText = typeof displayContent === 'string' ? displayContent : (typeof children === 'string' ? children : '');
    if (newText !== currentText) {
      setOverride(`elements.${resolvedKey}.text`, newText);
    }
  }, [resolvedKey, children, displayContent, setOverride]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditMode) {
      setDraggableSelectedId(null);
      setSelectedElement(resolvedKey, 'text');
      if (!override?._originalText) {
        const text = typeof children === 'string' ? children : (elRef.current?.innerText ?? '');
        if (text) {
          setOverride(`elements.${resolvedKey}._originalText`, text);
        }
      }
    }
  }, [isEditMode, resolvedKey, setSelectedElement, setDraggableSelectedId, override, children, setOverride]);

  const isThisSelected = selectedElementKey === resolvedKey;

  // Reset dropdowns when deselected
  React.useEffect(() => {
    if (!isThisSelected) {
      setShowColorPicker(false);
      setShowSizePicker(false);
    }
  }, [isThisSelected]);

  const handleColorChange = useCallback((color: string) => {
    setOverride(`elements.${resolvedKey}.color`, color);
    setShowColorPicker(false);
  }, [resolvedKey, setOverride]);

  const handleSizeChange = useCallback((size: string) => {
    setOverride(`elements.${resolvedKey}.fontSize`, size);
    setShowSizePicker(false);
  }, [resolvedKey, setOverride]);

  if (!isEditMode) {
    return <Component className={className} style={overrideStyle}>{displayContent}</Component>;
  }

  return (
    <span className="relative inline" style={{ isolation: "isolate" }}>
      <Component
        ref={elRef as React.Ref<never>}
        contentEditable
        suppressContentEditableWarning
        data-config-key={resolvedKey}
        className={`${className} outline-none border-b border-dashed border-transparent hover:border-[#B7FF5B]/50 focus:border-[#B7FF5B] transition-colors cursor-text select-text ${isThisSelected ? 'ring-2 ring-blue-400/50 rounded' : ''}`}
        style={overrideStyle}
        onClick={handleClick}
        onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
        onBlur={handleBlur}
      >
        {displayContent}
      </Component>

      {/* Inline toolbar — shows directly above the text when selected */}
      {isThisSelected && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 z-[9999]"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-0.5 bg-white rounded-2xl shadow-xl border border-gray-200 px-1.5 py-1 whitespace-nowrap">
            {/* Color picker */}
            <div className="relative">
              <button
                onClick={() => { setShowColorPicker(!showColorPicker); setShowSizePicker(false); }}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
                title="Text color"
              >
                <Paintbrush size={14} />
              </button>
              {showColorPicker && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-48">
                  <div className="grid grid-cols-6 gap-1.5 mb-3">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border-none cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleColorChange(customColor); }}
                      className="flex-1 text-xs font-mono text-gray-700 bg-gray-100 rounded-lg px-2 py-1.5 border-none outline-none"
                      placeholder="#000000"
                    />
                    <button
                      onClick={() => handleColorChange(customColor)}
                      className="text-xs font-bold text-white bg-gray-900 rounded-lg px-2 py-1.5 hover:bg-gray-700 transition-colors"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-gray-200" />

            {/* Font size picker */}
            <div className="relative">
              <button
                onClick={() => { setShowSizePicker(!showSizePicker); setShowColorPicker(false); }}
                className="flex items-center gap-1 p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
                title="Font size"
              >
                <Type size={14} />
                <ChevronDown size={10} />
              </button>
              {showSizePicker && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-1.5 min-w-[100px]">
                  {FONT_SIZES.map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => handleSizeChange(value)}
                      className="w-full text-left px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {label} <span className="text-gray-400 font-normal ml-1">{value}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
