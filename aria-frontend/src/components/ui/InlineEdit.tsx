import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface InlineEditProps {
  value: string;
  onSave: (val: string) => void;
  onCancel: () => void;
  className?: string;
}

export const InlineEdit: React.FC<InlineEditProps> = ({ value, onSave, onCancel, className = '' }) => {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSave = () => {
    if (editValue.trim() && editValue !== value) {
      onSave(editValue.trim());
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`} onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="w-full bg-[#2A2A2A] text-white text-xs px-2 py-1 rounded border border-[#8B5CF6] focus:outline-none"
      />
    </div>
  );
};
